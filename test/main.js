(function (storyContent) {

    window.api.send("loadFile");
    window.api.receive("sendFile", (data) => {

        // Create ink story from the content using inkjs
        var story = new inkjs.Story(storyContent);
        var storyHistory = { history: [] };

        // Save Game
        document.getElementById("save").addEventListener("click", () => {
            console.log(storyHistory)
            let savedJson = story.state.ToJson();
            window.api.send("saveFile", {name: "currentSave.json", data: savedJson});
            window.api.send("saveFile", {name: "history.json", data: JSON.stringify(storyHistory)})
        });

        // Watchers for variables within ink
        story.ObserveVariable("number_of_infected_people", (varName, newValue) => {
            console.log(newValue)
        });

        // Global tags - those at the top of the ink file
        // We support:
        //  # theme: dark
        //  # author: Your Name
        var globalTags = story.globalTags;
        if (globalTags) {
            for (var i = 0; i < story.globalTags.length; i++) {
                var globalTag = story.globalTags[i];
                var splitTag = splitPropertyTag(globalTag);

                // THEME: dark
             //   if (splitTag && splitTag.property == "theme") {
             //       document.body.classList.add(splitTag.val);
             //   }

                // author: Your Name
                if (splitTag && splitTag.property == "author") {
                    var byline = document.querySelector('.byline');
                    byline.innerHTML = "by " + splitTag.val;
                }

            }
        }

        var storyContainer = document.querySelector('#story');
        var choicesContainer = document.querySelector('#choices')
        var outerScrollContainer = document.querySelector('.outerContainer');

        if (data) {
            story.state.LoadJson(JSON.stringify(data));
        }
        console.log(story)

        function applyTags(delay) {
            var tags = story.currentTags;

            // Any special tags included with this line
            var customClasses = [];
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];

                // Detect tags of the form "X: Y". Currently used for IMAGE and CLASS but could be
                // customised to be used for other things too.
                var splitTag = splitPropertyTag(tag);

                // IMAGE: src
                if (splitTag && splitTag.property == "IMAGE") {
                    var imageElement = document.createElement('img');
                    imageElement.src = splitTag.val;
                    storyContainer.appendChild(imageElement);

                    showAfter(delay, imageElement);
                    delay += 200.0;
                }

                // BGM: src
                if (splitTag && splitTag.property == "BGM") {
                    var audio = splitTag.val;
                    let audioObject = new Audio(audio);
                    audioObject.loop = true;
                    audioObject.play();
                }

                // CLASS: className
                else if (splitTag && splitTag.property == "CLASS") {
                    customClasses.push(splitTag.val);
                }

                // CLEAR - removes all existing content.
                // RESTART - clears everything and restarts the story from the beginning
                else if (tag == "CLEAR" || tag == "RESTART") {
                    removeAll("p");
                    removeAll("img");

                    // Comment out this line if you want to leave the header visible when clearing
                    setVisible(".header", false);

                    if (tag == "RESTART") {
                        restart();
                        return;
                    }
                }
            }

            return customClasses;

        }

        function generateStoryParagraph(text, customClasses, delay) {
            storyHistory.history.push(text);
            // Create paragraph element (initially hidden)
            removeAll("p", storyContainer);
            var paragraphElement = document.createElement('p');
            paragraphElement.innerHTML = text;
            storyContainer.appendChild(paragraphElement);

            // Add any custom classes derived from ink tags
            for (var i = 0; i < customClasses.length; i++)
                paragraphElement.classList.add(customClasses[i]);

            // Fade in paragraph after a short delay
            showAfter(delay, paragraphElement);
            delay += 200.0;
        }

        // Kick off the start of the story!
        continueStory(true);

        // Main story processing function. Each time this is called it generates
        // all the next content up as far as the next set of choices.
        function continueStory(firstTime) {

            var paragraphIndex = 0;
            var delay = 0.0;

            // Generate story text - loop through available content
            while (story.canContinue) {

                // Get ink to generate the next paragraph
                var paragraphText = story.Continue();
                let customClasses = applyTags(delay)
                generateStoryParagraph(paragraphText, customClasses, delay);

            }

            if (!paragraphText) {

                let paragraphIndex = 0;

                // This runs when we load from file as the paragraph doesn't load by default
                let customClasses = applyTags(delay)
                generateStoryParagraph(story.currentText, customClasses, delay)


            }

            // Create HTML choices from ink choices
            story.currentChoices.forEach(function (choice) {

                // Create paragraph with anchor element
                var choiceParagraphElement = document.createElement('p');
                choiceParagraphElement.classList.add("choice");
                choiceParagraphElement.innerHTML = `<a href='#'>${choice.text}</a>`
                choicesContainer.appendChild(choiceParagraphElement);

                // Fade choice in after a short delay
                showAfter(delay, choiceParagraphElement);
                delay += 200.0;

                // Click on choice
                var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
                choiceAnchorEl.addEventListener("click", function (event) {

                    // Don't follow <a> link
                    event.preventDefault();

                    // Remove all existing choices
                    removeAll("p.choice", choicesContainer);

                    // Tell the story where to go next
                    story.ChooseChoiceIndex(choice.index);

                    // Aaand loop
                    continueStory();
                });
            });

            // Extend height to fit
            // We do this manually so that removing elements and creating new ones doesn't
            // cause the height (and therefore scroll) to jump backwards temporarily.
            storyContainer.style.height = contentBottomEdgeY() + "px";
        }

        function restart() {
            story.ResetState();

            setVisible(".header", true);

            continueStory(true);

            outerScrollContainer.scrollTo(0, 0);
        }

        // -----------------------------------
        // Various Helper functions
        // -----------------------------------

        // Fades in an element after a specified delay
        function showAfter(delay, el) {
            el.classList.add("hide");
            setTimeout(function () { el.classList.remove("hide") }, delay);
        }

        // Scrolls the page down, but no further than the bottom edge of what you could
        // see previously, so it doesn't go too far.
        function scrollDown(previousBottomEdge) {

            // Line up top of screen with the bottom of where the previous content ended
            var target = previousBottomEdge;

            // Can't go further than the very bottom of the page
            var limit = outerScrollContainer.scrollHeight - outerScrollContainer.clientHeight;
            if (target > limit) target = limit;

            var start = outerScrollContainer.scrollTop;

            var dist = target - start;
            var duration = 300 + 300 * dist / 100;
            var startTime = null;
            function step(time) {
                if (startTime == null) startTime = time;
                var t = (time - startTime) / duration;
                var lerp = 3 * t * t - 2 * t * t * t; // ease in/out
                outerScrollContainer.scrollTo(0, (1.0 - lerp) * start + lerp * target);
                if (t < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        // The Y coordinate of the bottom end of all the story content, used
        // for growing the container, and deciding how far to scroll.
        function contentBottomEdgeY() {
            var bottomElement = storyContainer.lastElementChild;
            return bottomElement ? bottomElement.offsetTop + bottomElement.offsetHeight : 0;
        }

        // Remove all elements that match the given selector. Used for removing choices after
        // you've picked one, as well as for the CLEAR and RESTART tags.
        function removeAll(selector, container) {
            var allElements = container.querySelectorAll(selector);
            console.log(allElements)
            for (var i = 0; i < allElements.length; i++) {
                var el = allElements[i];
                el.parentNode.removeChild(el);
            }
        }

        // Used for hiding and showing the header when you CLEAR or RESTART the story respectively.
        function setVisible(selector, visible) {
            var allElements = storyContainer.querySelectorAll(selector);
            for (var i = 0; i < allElements.length; i++) {
                var el = allElements[i];
                if (!visible)
                    el.classList.add("invisible");
                else
                    el.classList.remove("invisible");
            }
        }

        // Helper for parsing out tags of the form:
        //  # PROPERTY: value
        // e.g. IMAGE: source path
        function splitPropertyTag(tag) {
            var propertySplitIdx = tag.indexOf(":");
            if (propertySplitIdx != null) {
                var property = tag.substr(0, propertySplitIdx).trim();
                var val = tag.substr(propertySplitIdx + 1).trim();
                return {
                    property: property,
                    val: val
                };
            }

            return null;
        }

    });

})(storyContent);
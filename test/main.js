(function (storyContent) {
  /** ---------------------------
   *  Helper Functions
   * ----------------------------
   */

  const helper = {
    parseGlobalTags: (tags) => {
      let tagsObject = {};
      if (tags) {
        tags.forEach((tag) => {
          let tagArray = tag.split(":");
          if (tagArray.length === 2) {
            tagsObject[`${tagArray[0]}`] = tagArray[1].trim();
          }
        });
      } else {
        return null;
      }

      return tagsObject;
    },
  };

  /**
   * Check to see if we have a file with save data already. If we do, then it
   * gets passed to the sendFile channel as the parameter data (see the main.js in the root of the project).
   * If not then data is false/null
   *  */

  window.api.send("loadFile");

  // Create ink story from the content using inkjs
  var story = new inkjs.Story(storyContent);

  // Create an event listener for the save button so the user can save the state there in.
  document.getElementById("save").addEventListener("click", () => {
    let savedJson = story.state.ToJson();
    window.api.send("saveFile", { name: "currentSave.json", data: savedJson });
  });

  /** ---------------------------------------
   *  Variable Observables
   * ----------------------------------------
   * Every time a variable within ink is changed the observable function fires off
   */
  story.ObserveVariable("weapon", (varName, newValue) => {
    console.log(newValue);
  });

  /** ---------------------------------------
   *  Global Tags
   * ----------------------------------------
   * Any tags provided at the very top of the main ink file are accessible via the Story's globalTags property,
   * which also returns a List<string>. Any top level story metadata can be included there.
   */
  const globalTags = helper.parseGlobalTags(story.globalTags);

  /** ---------------------------------------
   *  Grab Dom Elements for appending story elements
   * ----------------------------------------
   */
  const storyWrapperDiv = document.getElementById("story-wrapper");
  const questionWrapperDiv = document.getElementById("question-wrapper");

  window.api.receive("sendFile", (data) => {
    //  if (data) {
    //      story.state.LoadJson(JSON.stringify(data));
    //  }

    continueStory();

    function continueStory() {
    /** ---------------------------------------
     *  Display story text
     * ----------------------------------------
     * This displays the story text line by line until it hits a choice
     */
      while (story.canContinue) {
        let currentStoryLine = story.Continue();
        let paragraph = document.createElement("p");
        let lineText = document.createTextNode(currentStoryLine);

        paragraph.appendChild(lineText);
        storyWrapperDiv.append(paragraph);
      }

    /** ---------------------------------------
     *  Display choices
     * ----------------------------------------
     * This takes the choices and displays and add click event
     * to each once. Once clicked we pass the choice index to the story
     * which triggers the next node of the story and we rerun
     * this function.
     */
      if (story.currentChoices.length > 0) {
        story.currentChoices.forEach((choice) => {
          console.log(choice);

          let anchor = document.createElement("a");
          anchor.href = "#";
          let questionText = document.createTextNode(choice.text);

          anchor.appendChild(questionText);
          questionWrapperDiv.append(anchor);

          anchor.addEventListener("click", function (event) {
            // Don't follow <a> link
            event.preventDefault();

            storyWrapperDiv.innerHTML = "";
            questionWrapperDiv.innerHTML = "";

            // Tell the story where to go next
            story.ChooseChoiceIndex(choice.index);

            // Start the process again but now with updated story index
            continueStory();
          });
        });
      }
    }

  });
})(storyContent);

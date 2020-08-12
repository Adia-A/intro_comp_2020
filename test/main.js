(function (storyContent) {

    /** ---------------------------
     *  Helper Functions
     * ----------------------------
     */

    const helper = {
        parseGlobalTags: (tags) => {
            let tagsObject = {}
            if (tags) {
                tags.forEach(tag => {
                    let tagArray = tag.split(':')
                    if(tagArray.length === 2) {
                        tagsObject[`${tagArray[0]}`] = tagArray[1].trim()
                    }
                });
            } else {
                return null
            }

            return tagsObject

        }
    }

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
        window.api.send("saveFile", {name: "currentSave.json", data: savedJson});
    });

    /** ---------------------------------------
     *  Variable Observables
     * ----------------------------------------
     * Everytime a variable within ink is changed the observable function fires off
     */
    story.ObserveVariable("sanity", (varName, newValue) => {
        console.log(newValue)
    });

    /** ---------------------------------------
     *  Global Tags
     * ----------------------------------------
     * Any tags provided at the very top of the main ink file are accessible via the Story's globalTags property, 
     * which also returns a List<string>. Any top level story metadata can be included there.
     */
    console.log(story.globalTags)
    const globalTags = helper.parseGlobalTags(story.globalTags);
    console.log(globalTags);

    window.api.receive("sendFile", (data) => {

      //  if (data) {
      //      story.state.LoadJson(JSON.stringify(data));
      //  }

        

    });

})(storyContent);
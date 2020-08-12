(function () {

    function changeLocation() {
        location.assign('story.html')
    }

    TweenMax.set('.quote-container', {
        visibility: 'visible'
    })

    function splitQuote() {
        let tl = new TimelineMax({
            onComplete: changeLocation
        })
        let quoteSplitText = new SplitText('#quote', {type: "words,chars"})
        
        tl.staggerFrom(quoteSplitText.words, 5, {opacity: 0}, 0.3);
        tl.to('#quote-attribution', 2, {opacity: 1})
        tl.addLabel('fade-out')
        tl.to('#quote', 3, {opacity: 0}, 'fade-out')
        tl.to('#quote-attribution', 2, {opacity: 0}, 'fade-out')

    }

    splitQuote();

})();
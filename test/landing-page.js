
TweenMax.set('.start-button', {
    y: document.getElementsByClassName('container').offsetHeight + 200
})

TweenMax.set('#spell-book-svg', {
    visibility: 'visible'
})

function spellBookEntrance() {
    let tl = new TimelineMax();
    const sparkles = document.querySelectorAll('.sparkle')

    tl.from('#book-and-fire', 3, {
        y: -300,
        ease: Back.easeOut
    })

    tl.staggerFrom(sparkles, 3, {
        y: -300,
        ease: Power2.easeOut
    }, 0.1, '-=2')

    tl.to('#pentagram', 1, {
        opacity: 1
    })

    return tl;
}

function sparkles() {
    let tl = new TimelineMax({repeat: -1});
    const sparkles = document.querySelectorAll('.sparkle')

    tl.staggerTo(sparkles, 1, {
        opacity: 0
    }, 0.2)
    tl.staggerTo(sparkles, 1, {
        opacity: 1
    }, 0.2)
    
    return tl;
}

function fadeInTitle() {
    let tl = new TimelineMax();

    tl.to('.title-text', 3, {
        opacity: 1
    })

    return tl;

}

function buttonEntrance() {
    let tl = new TimelineMax();

    tl.to('.start-button', 1, {
        opacity: 1
    })
    tl.from('.start-button', 3, {
        y: 200,
        ease: Back.easeOut
    })

    return tl;
}

const master = new TimelineMax({
    onReverseComplete: changeLocation
})

master.add(spellBookEntrance(), 'book-entrance')
master.add(sparkles(), 'glowing-sparkles')
master.add(fadeInTitle(), 'glowing-sparkles')
master.add(buttonEntrance(), 'glowing-sparkles')

function changeLocation() {
    location.assign('intro.html')
}

const startButton = document.getElementById('start-button');

startButton.addEventListener('click', function (event) {
    TweenMax.to('.start-button', 2, {width: '20%' });
    master.timeScale(3).reverse();
});


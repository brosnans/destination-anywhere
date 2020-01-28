var bp;
var section = "home";
var xs = false, sm = false, md = false, lg = false;
const all_elements = ['home', 'header', 'explore', 'navigate', 'discover', 'logo', 'search-form', 'city-name', 'back-icon']
const home_xs = ['home', 'logo', 'search-form'];
const home_sm = ['home', 'logo', 'search-form'];
const home_md = ['home', 'logo', 'search-form'];
const home_lg = ['home', 'logo', 'search-form'];
const explore_xs = ['header', 'explore', 'logo', 'search-form', 'back-icon'];
const explore_sm = ['header', 'explore', 'logo', 'search-form', 'back-icon'];
const explore_md = ['header', 'explore', 'navigate', 'logo', 'search-form', 'back-icon'];
const explore_lg = ['header', 'explore', 'navigate', 'logo', 'search-form', 'back-icon'];
const navigate_xs = ['header', 'navigate', 'logo', 'search-form', 'back-icon'];
const navigate_sm = ['header', 'navigate', 'logo', 'search-form', 'back-icon'];
const navigate_md = ['header', 'explore', 'navigate', 'logo', 'search-form', 'back-icon'];
const navigate_lg = ['header', 'explore', 'navigate', 'logo', 'search-form', 'back-icon'];
const discover_xs = ['header', 'navigate', 'discover', 'logo', 'city-name', 'back-icon'];
const discover_sm = ['header', 'navigate', 'discover', 'logo', 'city-name', 'back-icon'];
const discover_md = ['header', 'navigate', 'discover', 'city-name', 'back-icon'];
const discover_lg = ['header', 'explore', 'navigate', 'discover', 'logo', 'search-form', 'city-name', 'back-icon'];

setCurrentBreakpoint();

function setCurrentBreakpoint() {
    bp = window.getComputedStyle(document.getElementById('breakpoint-tracker'), ':before').content.substr(1, 2);

    xs = Boolean(bp == "xs");
    sm = Boolean(bp == "sm");
    md = Boolean(bp == "md");
    lg = Boolean(bp == "lg");
    // console.log(bp, xs, sm, md, lg);
};

function setCurrentSection(s) {
    section = s;
};

/*
* EVENT HANDLERS
*/

// window resized
$(window).resize(function () {
    setCurrentBreakpoint();
    toggleElements(eval(`${section}_${bp}`));
});

$('.logo').click(function () {
    toggleElements(eval(`home_${bp}`));
});

// home button clicked
$('.home a').click(function () {
    if (xs || sm) {
        if ($(this).attr('href').substr(1) == "explore") {
            toggleElements(explore_xs);
            setCurrentSection("explore");
        } else {
            toggleElements(navigate_xs);
            setCurrentSection("navigate");
        }
    } else if (md) {
        toggleElements(navigate_md);
        setCurrentSection("navigate");
    }
    else {
        toggleElements(navigate_md);
        setCurrentSection("navigate");
    }
});

// explore button clicked
$('.explore a').click(function () {
    // Call initMap (map.js) to update markers
    var cities_list = $(this).text().trim().split(' ').join('_');
    initMap(cities_list);

    if (xs || sm) {
        toggleElements(navigate_xs);
        setCurrentSection("navigate");
    }
    else if (md) {
        toggleElements(navigate_md);
        setCurrentSection("navigate");
    } else {
        //lg
        toggleElements(navigate_lg);
        setCurrentSection("navigate");
    }
});

function cityClicked(label) {
    if (xs || sm) {
        toggleElements(discover_xs);
    } else if (md) {
        toggleElements(discover_md);
    }
    else {
        // lg
        toggleElements(discover_lg);
    }
    setCurrentSection("discover");
    $('.city-name').text(label);
};

function venueClicked() {
    if (!xs) {
        if (sm) {
            $('.modal-dialog').css('margin', '1.75rem auto');
        } else {
            $('.modal-dialog').css('margin', '1.75rem 3rem');
        };
        setTimeout(function () {
            $('#venueModal').modal('show');
        }, 800);
    } else {
        $('.venue').removeClass('d-none');
    };
};

// close venue clicked
$('.close-icon').click(function () {
    hideVenue();
});

// back-icon clicked
$('.back-icon').click(function () {
    // Reset city search input box
    $('.city-search').val('');
    // Reset legend
    $('.legend-btn').children('i').removeClass("invisible");
    if (xs || sm) {
        if ($('.search-form').hasClass('d-none')) {
            toggleElements(navigate_xs);
            setCurrentSection("navigate");
            addCityClusters();
            if (!$('.venue').hasClass('d-none')) {
                hideVenue();
            };
        } else if ($('.discover').hasClass('d-none') && $('.explore').hasClass('d-none')) {
            toggleElements(explore_xs);
            setCurrentSection("explore");
        } else {
            toggleElements(home_xs);
            setCurrentSection("home");
        }
    } else {
        // md or lg
        if (!$('.discover').hasClass('d-none')) {
            toggleElements(navigate_md);
            setCurrentSection("navigate");
            addCityClusters();
            if (!$('.venue').hasClass('d-none')) {
                hideVenue();
            };
        } else {
            toggleElements(home_xs);
            setCurrentSection("home");
        }
    }
});

function hideVenue() {
    $('.venue').addClass('d-none');
};

function showElements(elements) {
    elements.forEach(function (elem) {
        $("." + elem).removeClass('d-none');
    });
};

function hideElements(elements) {
    elements.forEach(function (elem) {
        $("." + elem).addClass('d-none');
    });
};

function toggleElements(elements) {
    var to_hide = all_elements.filter(
        function (item) {
            return !elements.includes(item);
        }
    );

    if ((section === 'home' || section == 'explore') && (to_hide.includes('home') || to_hide.includes('explore'))) {

        var animation = eval(`animation_${section}`);
        // Fade out home
        $('.' + section).addClass(animation).one(animationend, function () {

            // On animation end
            $(this).removeClass(animation);
            // $(this).addClass('d-none');

            // Hide elements
            hideElements(to_hide);

            // Show elements
            showElements(elements);
        });

    } else {
        // Hide elements
        hideElements(to_hide);

        // Show elements
        showElements(elements);
    };

};
/*
* Variables
*/

var map;
var autocomplete;
var service;
var city_markers;
var cities_cluster;

var attractions_markers;
var accommodation_markers;
var restaurants_markers;

var attractions_cluster;
var accommodation_cluster;
var restaurants_cluster;

var attractions = [];
var accommodation = [];
var restaurants = [];

var info_windows = [];

// Create map
function initMap(cities_list) {

    if (typeof (cities_list) === 'undefined') {
        cities_list = "all_cities";
    }

    // Create map
    var center = { lat: 40.4165, lng: -3.70256 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 2,
        styles: map_styles
    });

    getCities(cities_list).then(function (cities) {
        // Create city markers
        createCityMarkers(cities);
    });

    // Add autocomplete service
    autocomplete = new google.maps.places.Autocomplete($('#citySearch')[0], { types: ['(cities)'] });
    autocomplete.addListener('place_changed', onCitySearch);
};

// Navigate to city selected from search box
function onCitySearch() {
    removeMarkers(city_markers, cities_cluster);
    var searched_city = [];
    searched_city.push(autocomplete.getPlace());
    createCityMarkers(searched_city);
    new google.maps.event.trigger(city_markers[0], 'click');
}

/*
* City Markers
*/

// Get cities JSON data
function getCities(cities_list) {
    switch (cities_list) {
        case 'all_cities':
            return $.getJSON("assets/data/all_cities.json").then(function (data) {
                return data;
            });
            break;
        case 'top_10_culture':
            return $.getJSON("assets/data/top_10_culture.json").then(function (data) {
                return data;
            });
            break;
        case 'top_10_food':
            return $.getJSON("assets/data/top_10_food.json").then(function (data) {
                return data;
            });
            break;
        case 'top_10_shopping':
            return $.getJSON("assets/data/top_10_shopping.json").then(function (data) {
                return data;
            });
            break;
        default:
    }
};

// Create city markers
function createCityMarkers(cities) {
    city_markers = cities.map(function (city, i) {
        // Change label for Top 10 list
        var city_label = (cities.length === 10) ? `${city.rank}. ${city.name}` : `${city.name}`;

        var city_location = (city.lat) ? { lat: city.lat, lng: city.lon } : city.geometry.location;

        return new google.maps.Marker({
            position: city_location,
            label: city_label,
            icon: 'assets/images/marker_city.png'
        });
    });

    // Add event listners for city markers
    createCityHandlers(city_markers);

    // Create city clusters
    addCityClusters();
};

// Handle city marker click events
function createCityHandlers(markers) {
    markers.forEach(function (marker) {
        google.maps.event.addListener(marker, 'click', function () {
            map.setZoom(14);
            map.setCenter(marker.getPosition());

            // Update navigation (router.js)
            cityClicked(marker.label);

            // Get places (venues) in the city
            getPlaces(marker);

            // Create markers and populate venue-lists section
            displayPlaces();
        });
    });
};

// Add cities to map
function addCityClusters() {
    cities_cluster = new MarkerClusterer(map, city_markers,
        { imagePath: 'assets/images/clusters/m' });
    if (attractions.length > 0) {
        removePlaceMarkers();
    }; map.setZoom(2);
};


/*
* Place Markers
*/

// Request attractions, accommodation and bars & restaurants from the Places library
function getPlaces(city) {

    // Clear any existing places
    emptyArray(attractions);
    emptyArray(accommodation);
    emptyArray(restaurants);

    var types = [['lodging'], ['bar'], ['restaurant'], ['amusement_park'], ['aquarium'], ['art_gallery'], ['museum'], ['zoo']];
    service = new google.maps.places.PlacesService(map);

    types.forEach(function (type) {
        var request = {
            location: city.position,
            radius: '5000',
            type: type
        };
        service.nearbySearch(request, placesCallback);
    });
};

// Put places into arrays
function placesCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var place = results[i];

            // Sort places into categories

            // accommodation
            if (place.types.includes('lodging')) {
                var exists = accommodation.filter(function (elem) {
                    return elem.name === place.name;
                });
                if (exists.length === 0) {
                    accommodation.push(place);
                };
            };

            // restaurants
            if (place.types.includes('bar') || place.types.includes('restaurant')) {
                var exists = restaurants.filter(function (elem) {
                    return elem.name === place.name;
                });
                if (exists.length === 0) {
                    restaurants.push(place);
                };
            };

            //attractions
            if (place.types.includes('amusement_park') || place.types.includes('aquarium') || place.types.includes('art_gallery') || place.types.includes('museum') || place.types.includes('zoo')) {
                var exists = attractions.filter(function (elem) {
                    return elem.name === place.name;
                });
                if (exists.length === 0) {
                    attractions.push(place);
                };
            };
        }
    }
};

// Used to reset attractions, accommodation and resturants arrays
function emptyArray(a) {
    a.length = 0;
};

// Create places markers
function createPlacesMarkers() {

    attractions_markers = attractions.map(function (place, i) {
        return new google.maps.Marker({
            position: place.geometry.location,
            icon: 'assets/images/marker_attractions.png'
        });
    });
    accommodation_markers = accommodation.map(function (place, i) {
        return new google.maps.Marker({
            position: place.geometry.location,
            icon: 'assets/images/marker_accommodation.png'
        });
    });
    restaurants_markers = restaurants.map(function (place, i) {
        return new google.maps.Marker({
            position: place.geometry.location,
            icon: 'assets/images/marker_restaurants.png'
        });
    });

    // Add event listners for place markers
    createPlaceHandlers(attractions_markers, attractions);
    createPlaceHandlers(accommodation_markers, accommodation);
    createPlaceHandlers(restaurants_markers, restaurants);

    // Create clusters
    addPlaceClusters();
};

// Handle place marker click events
function createPlaceHandlers(markers, places) {
    markers.forEach(function (marker) {
        google.maps.event.addListener(marker, 'click', function () {

            // Update venue info
            var place = places[markers.indexOf(marker)];
            showVenue(marker, place);
        });
    });
};

// Add places to map
function addPlaceClusters() {
    attractions_cluster = new MarkerClusterer(map, attractions_markers,
        { imagePath: 'assets/images/clusters/cluster_attractions_m' });
    accommodation_cluster = new MarkerClusterer(map, accommodation_markers,
        { imagePath: 'assets/images/clusters/cluster_accommodation_m' });
    restaurants_cluster = new MarkerClusterer(map, restaurants_markers,
        { imagePath: 'assets/images/clusters/cluster_restaurants_m' });
};

function removePlaceMarkers() {
    removeMarkers(attractions_markers, attractions_cluster);
    removeMarkers(accommodation_markers, accommodation_cluster);
    removeMarkers(restaurants_markers, restaurants_cluster);
};

// Remove markers from map
function removeMarkers(markers, clusterer) {
    markers.forEach(function (marker) {
        marker.setMap(null);
    });
    clusterer.clearMarkers();
};

// Called in city marker click handler
function displayPlaces() {

    setTimeout(function () {
        createPlacesMarkers();
        removeMarkers(city_markers, cities_cluster);

        addVenueLists();

    }, 1000);

};

// Popluate venue lists section with places
function addVenueLists() {

    lists = [attractions, accommodation, restaurants];
    types = ['attractions', 'accommodation', 'restaurants'];

    lists.forEach(function (list, index) {
        type = types[index];

        // Clear any previous places
        $(`.venue-list-${type} .venue-list>.row`).empty();

        // Add new places
        list.forEach(function (place) {
            var place_photo = (!place.photos) ? place.icon : place.photos[0].getUrl({ 'maxWidth': 60, 'maxHeight': 60 });

            $(`.venue-list-${type} .venue-list>.row`).append(
                `<div class="col-4 col-lg-6 venue-list-item .venue-list-item-${type}">
                <div class="row no-gutters">
                    <div class="col-3 venue-list-image" style="background-image:url(${place_photo});">
                    </div>
                    <div class="col-9">
                        <p class="small">${place.name}</p>
                    </div>
                </div>
            </div>`
            );
        });
    });

    // Listen for venue list item click
    addVenueListItemListener();
};

// Update venue info section with clicked place details
function updateVenueInfo(place) {

    // Place details
    var place_details;
    var request = {
        placeId: place.place_id
    };

    service.getDetails(request, function (details, status) {
        place_details = details;
        if (status == google.maps.places.PlacesServiceStatus.OK) {

            $('.venue-image').css('background-image', function () {
                var place_photo = (!place.photos) ? place.icon : place.photos[0].getUrl({ 'maxWidth': 375, 'maxHeight': 400 });
                return `url(${place_photo})`;
            });

            $('.venue-name').text(place.name);

            $('.venue-type').text(place.types.slice(0, 3).join(", "));

            // Rating
            $('.rating .score').text(place.rating);
            $('.rating .stars').empty();
            if (place.rating) {
                var full_stars = Math.floor(place.rating);
                var half_star = (function () {
                    var fraction = parseInt(String(place.rating).substr(2, 1));
                    if (fraction < 3) {
                        return false;
                    } else if (fraction < 8) {
                        return true;
                    } else if (fraction >= 8) {
                        full_stars++;
                        return false;
                    } else {
                        return false;
                    }
                })();
                var empty_stars = 5 - (full_stars + half_star);

                // full stars
                for (var i = 0; i < full_stars; i++) {
                    $('.rating .stars').append('<i class="fa fa-star"></i>');
                };
                // half stars
                if (half_star) {
                    $('.rating .stars').append('<i class="fa fa-star-half-o"></i>');
                };
                // empty stars
                for (var i = 0; i < empty_stars; i++) {
                    $('.rating .stars').append('<i class="fa fa-star-o"></i>');
                };
            };

            $('.venue-address').text(place.vicinity);

            if (place_details.website) {
                $('.website').show();
                $('.venue-website a').attr('href', place_details.website);
                $('.venue-website a').text(`${place_details.website.substr(0, 30)}...`);
            } else {
                $('.website').hide();
            };

            if (place_details.international_phone_number) {
                $('.phone').show();
                $('.venue-phone').text(place_details.international_phone_number);
            } else {
                $('.phone').hide();
            };

            if (place_details.opening_hours) {
                var d = new Date();
                var hours_today = place_details.opening_hours.weekday_text;
                hours_today.unshift(hours_today.pop());
                $('.opening-hours').show();
                $('.venue-opening-hours').text(hours_today[d.getDay()]);
            } else {
                $('.opening-hours').hide();
            }
        };
    });

}

function showVenue(marker, place) {

    // Populate venue info with selected place details
    updateVenueInfo(place);

    // Update navigation (router.js)
    venueClicked();

    // Toggle info window
    infowindow = new google.maps.InfoWindow({
        content: place.name
    });
    // Close any open info window, if any
    info_windows.push(infowindow);
    info_windows.forEach(function (window) {
        window.close();
    });

    infowindow.open(map, marker);

    // Pan map to marker
    map.panTo(marker.getPosition());
}

function addVenueListItemListener() {
    $('.venue-list-item').click(function () {

        var clicked_name = $(this).text().trim();
        var category = this.classList[3].substr(17);

        var places_array = eval(category);
        var markers_array = eval(category + '_markers');

        var place = places_array.filter(function (p, i) {
            return p.name === clicked_name;
        });

        var marker = markers_array[places_array.indexOf(place[0])];

        showVenue(marker, place[0]);
    });
};

// Legend buttons click handler
$('.legend-btn').click(function () {
    $(this).children('i').toggleClass("invisible");
    togglePlaces($(this).siblings('.legend-label').text().toLowerCase());
});

// Show or hide place markers by category on legend
function togglePlaces(category) {
    if (eval(category + '_cluster').markers_.length === 0) {
        // Add markers
        eval(`${category}_cluster = new MarkerClusterer(map, ${category}_markers,
            { imagePath: 'assets/images/clusters/cluster_${category}_m' })`);
        // Show venue list
        $('#collapse_' + category).collapse('show');

    } else {
        // Clear markers
        eval(category + '_cluster').clearMarkers();
        // Hide venue list
        $('#collapse_' + category).collapse('hide');
    }
};


// Styles for map
var map_styles = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#523735"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#c9b2a6"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#dcd2be"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ae9e90"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#93817c"
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.government",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.medical",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a5b076"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#447530"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.school",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.sports_complex",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fdfcf8"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f8c967"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#e9bc62"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e98d58"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#db8555"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#806b63"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8f7d77"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#b9d3c2"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#92998d"
            }
        ]
    }
];
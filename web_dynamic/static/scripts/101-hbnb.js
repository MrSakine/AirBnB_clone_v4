const $ = window.$;
$(document).ready(function () {
  const HOST = '0.0.0.0';

  $.get(`http://${HOST}:5001/api/v1/status/`, data => {
    if (data.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  function updateLocations (states, cities) {
    const locations = Object.assign({}, states, cities);
    if (Object.values(locations).length === 0) {
      $('.locations h4').html('&nbsp;');
    } else {
      $('.locations h4').text(Object.values(locations).join(', '));
    }
  }

  const states = {};
  $('.locations ul h2 input[type="checkbox"]').click(function () {
    if ($(this).is(':checked')) {
      states[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete states[$(this).attr('data-id')];
    }
    updateLocations(states, cities);
  });

  const cities = {};
  $('.locations ul ul li input[type="checkbox"]').click(function () {
    if ($(this).is(':checked')) {
      cities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete cities[$(this).attr('data-id')];
    }
    updateLocations(states, cities);
  });

  const amenities = {};
  $('.amenities input[type="checkbox"]').click(function () {
    if ($(this).is(':checked')) {
      amenities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete amenities[$(this).attr('data-id')];
    }
    $('.amenities h4').text(Object.values(amenities).join(', '));
  });

  function search (filters = {}) {
    $('.loader').text('Fetching data...');
    $.ajax({
      type: 'POST',
      url: `http://${HOST}:5001/api/v1/places_search`,
      data: JSON.stringify(filters),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        $('SECTION.places').empty();
        data.forEach(place => {
          $('.loader').text('Fetching data...');
          $.get(`http://${HOST}:5001/api/v1/places/${place.id}/reviews`, function (reviews) {
            $.get(`http://${HOST}:5001/api/v1/users/${place.user_id}/`, function (user) {
              $('.loader').text('');
              let reviewsHTML = '';
              reviews.forEach((review) => {
                const originalDate = new Date(review.created_at);
                const day = originalDate.getDate();
                const month = originalDate.toLocaleString('en-US', { month: 'long' });
                const year = originalDate.getFullYear();
                const formattedDate = `${day}th ${month} ${year}`;

                reviewsHTML += `
                <li>
                  <h3>From ${user.first_name} ${user.last_name} the ${formattedDate}</h3>
                  <p>${review.text}</p>
                </li>`;
              });
              const template = `
              <article>
                <div class="title_box">
                  <h2>${place.name}</h2>
                  <div class="price_by_night">${place.price_by_night}</div>
                </div>
                <div class="information">
                  <div class="max_guest">${place.max_guest} Guests</div>
                  <div class="number_rooms">${place.number_rooms} Bedrooms</div>
                  <div class="number_bathrooms">${place.number_bathrooms} Bathrooms</div>
                </div>
                <div class="description">
                  ${place.description}
                </div>
                <div class=reviews data-id="${place.id}">
                  <div class="review_title">
                    <h2>${reviews.length} Reviews</h2>
                    <span class="toggle-hide-show">hide</span>
                  </div>
                  <ul>
                  ${reviewsHTML}
                  </ul>
                </div>
              </article>`;

              $('SECTION.places').append(template);
              $(`.reviews[data-id="${place.id}"] .review_title span`).on('click', function (e) {
                const reviewsContainer = $(this).closest('.reviews');
                const reviewsList = reviewsContainer.find('ul');
                reviewsList.toggleClass('hide');
                const spanText = reviewsList.hasClass('hide') ? 'show' : 'hide';
                $(this).text(spanText);
              });
            });
          });
        });
      }
    });
  }

  $('#search').click(function () {
    const filters = {
      states: Object.keys(states),
      cities: Object.keys(cities),
      amenities: Object.keys(amenities)
    };

    search(filters);
  });
  search();
});

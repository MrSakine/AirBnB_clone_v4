const $ = window.$;
$(document).ready(function () {
  const nameAmenity = [];
  const idAmenities = [];
  $('input:checkbox').click(function () {
    if ($(this).is(':checked')) {
      nameAmenity.push($(this).attr('data-name'));
      idAmenities.push($(this).attr('data-id'));
    } else {
      const nameIndex = nameAmenity.indexOf($(this).attr('data-name'));
      const idIndex = idAmenities.indexOf($(this).attr('data-id'));
      nameAmenity.splice(nameIndex, 1);
      idAmenities.splice(idIndex, 1);
    }
    $('.amenities h4').text(nameAmenity.join(', '));
  });

  $.get('http://0.0.0.0:5001/api/v1/status/', (res) => {
    if (res.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  function appendData (data) {
    $('SECTION.places').append(data.map(place => {
      return `<article>
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
              </article>`;
    }));
  }

  $.ajax({
    type: 'POST',
    url: 'http://0.0.0.0:5001/api/v1/places_search',
    data: '{}',
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
      appendData(data);
    }
  });

  const button = $('button.btn-search');
  button.click(function () {
    $.ajax({
      type: 'POST',
      url: 'http://0.0.0.0:5001/api/v1/places_search',
      data: JSON.stringify({ amenities: idAmenities }),
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        $('SECTION.places').empty();
        appendData(data);
      }
    });
  });
});

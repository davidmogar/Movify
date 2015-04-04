var pageHistory = new Array();
var currentMovieId = 0;
var currentMovieRating = 0;

$(function() {
  $('nav a.page-link').click(function(e) {
    e.preventDefault();

    var link = $(this);
    if (!link.hasClass('active')) {
      showPage(this.getAttribute('data-page'), link);
    }
  });

  $('.genre a').click(function(e) {
    e.preventDefault();

    var link = $(this);
    if (!link.hasClass('active')) {
      showMoviesByGenre(this.getAttribute('data-genre'));
    }
  });

  $('.movie .cover').click(function(e) {
    showDetailsPage($(e.target).closest('.movie').data('movieId'));
  });

  $('#search-link').click(function(e) {
    if (!$(this).hasClass('active')) {
      $('#search').removeClass('closed');
      $('nav a.active').add(this).toggleClass('active');
    }
  });

  $('#search input').keyup(function(e) {
    var value = $(this).val();
    if(e.keyCode == 13 && value) {
      $('#search').addClass('closed');
      searchMovies(value);
      $(this).val('');
    }
  });

  $('#back-link').click(function(e) {
    showPage(pageHistory.pop(), 'back');
  });

  $('#details .movie-link, #details .trailer-link').click(function(e) {
    showPlayer($(this).data('url'));
  });

  $(document).mouseup(function(e) {
    var search = $('#search');

    if (!search.hasClass('closed') && !search.is(e.target) && search.has(e.target).length === 0) {
      search.addClass('closed');
      $('#search-link').removeClass('active');
    }
  });

  $('#player video').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
    var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    $('body').css('overflow-y', state? 'hidden' : 'scroll');
    $('#content').css('margin-left', state? 0 : '90px');
    $('nav').css('display', state? 'none' : 'block');
  });
});

function showPage(pageId, link) {
  var current = $('.page.current');
  var next = $('#' + pageId);

  if (current.length && next.length) {
    if (link != 'back') {
      pageHistory.push(current.attr('id'));
    }

    current.removeClass('current');
    next.addClass('current');

    $('nav a.active').add(link).toggleClass('active');

    $(window).scrollTop(0);

    if (pageId == 'browse') {
      $('#back-link').addClass('hidden');
      $('nav a.active').removeClass('active');
      $('#browse-link').addClass('active');
    } else {
      $('#back-link').removeClass('hidden');
    }

    if (pageId != 'player') {
      $('#player video')[0].pause();
    }

    if (pageId != 'details' && pageId != 'player') {
      $('#movie-background').hide();
    }
  }
}

function showDetailsPage(movieId) {
  $.get('http://156.35.95.67/movify/movies/' + movieId, function(data) {
    data = $.parseJSON(data);

    currentMovieId = data.id;
    currentMovieRating = 0;

    $('#movie-background').css('background', 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(' + data.background + ')');
    $('#movie-background').show();

    $('#details .cover').attr('src', data.cover);

    for (var i = 0; i < data.genres.length; i++) {
      data.genres[i] = '<span class="genre-name">' + data.genres[i].name + '</span>';
    };

    $('#details .title').text(data.title);
    $('#player .title').text(data.title);
    $('#movie-rating').rating({ showClear: false, size: 'xs', disabled: true });
    $('#movie-rating').rating('update', data.rating);
    $('#details .genres').html(data.genres.join(', '));
    $('#details .year').text(data.year);
    $('#details .duration').text(getDuration(data.duration));
    $('#details .movie-link').data('url', data.movie);
    $('#details .trailer-link').data('url', data.movie);
    $('#details .director').text(data.director);
    $('#details .writers').text(data.writers);
    $('#details .stars').text(data.stars);
    $('#details .storyline').html('<p>' + data.storyline + '</p>');

    if (data.hasOwnProperty('userReview')) {
      addUserReview(data.userReview);
    } else {
      addReviewForm();
    }

    var reviews = '';

    for (var i = 0; i < data.reviews.length; i++) {
      reviews += '<div class="review">';
      reviews += '  <div class="comment">';
      reviews += '    <div class="row">';
      reviews += '      <div class="col-xs-8">';
      reviews += '        <p class="username">' + data.reviews[i].username + '</p>';
      reviews += '        <p class="user-comment">' + data.reviews[i].comment + '</p>';
      reviews += '      </div>';
      reviews += '      <div class="col-xs-4 rating-container">';
      reviews += '        <span class="rating">' + data.reviews[i].rating + '<span class="small">/5</span></span>';
      reviews += '      </div>';
      reviews += '    </div>';
      reviews += '  </div>';
      reviews += '</div>';
    }

    $('#details .reviews').html(reviews);

    showPage('details');

    $('#back-link').removeClass('hidden');
  });
}

function showMoviesByGenre(genre) {
  $.get('http://156.35.95.67/movify/genres/' + genre + '/movies', function(data) {
    data = $.parseJSON(data);

    var content = '';

    for (var i = 0; i < data.length; i++) {
      var movie = data[i];

      content += '<div class="col-md-2 col-sm-4 movie" data-movie-id="' + movie.id + '">';
      content += '  <div class="cover">';
      content += '    <img class="img-responsive" src="' + movie.cover + '" />';
      content += '  </div>';
      content += '  <div class="info">';
      content += '    <p>' + movie.description + '</p>';
      content += '  </div>';
      content += '</div>';
    };

    $('#movies .row').html(content);

    $('.movie .cover').click(function(e) {
      showDetailsPage($(e.target).closest('.movie').data('movieId'));
    });

    showPage('movies');
  });
}

function searchMovies(title) {
  $.get('http://156.35.95.67/movify/movies?search=' + title, function(data) {
    data = $.parseJSON(data);

    var content = '';

    for (var i = 0; i < data.length; i++) {
      var movie = data[i];

      content += '<div class="col-md-2 col-sm-4 movie" data-movie-id="' + movie.id + '">';
      content += '  <div class="cover">';
      content += '    <img class="img-responsive" src="' + movie.cover + '" />';
      content += '  </div>';
      content += '  <div class="info">';
      content += '    <p>' + movie.description + '</p>';
      content += '  </div>';
      content += '</div>';
    };

    $('#movies .row').html(content);

    $('.movie .cover').click(function(e) {
      showDetailsPage($(e.target).closest('.movie').data('movieId'));
    });

    showPage('movies');
  });
}

function showPlayer(url) {
  $('#player video source').attr('src', url);
  $('#player video').load()
  $('#player video')[0].play();

  showPage('player');  
};

function submitReview() {
  var textarea = $("#user-review");
  var comment = textarea.val();

  if (comment) {
    $.ajax({
      type: 'post',
      url: 'http://156.35.95.67/movify/movies/' + currentMovieId + '/reviews',
      data: JSON.stringify({comment: comment, rating: currentMovieRating}),
      contentType: 'application/json',
      traditional: true,
      success: function(data) {
        addUserReview($.parseJSON(data));
      }
    });
  }
}

function addReviewForm() {
  $('#your-review').html('');

  var form = '<textarea id="user-review" type="text"></textarea>';
  form += '<div class="row">';
  form += '  <div class="col-sm-7">';
  form += '    <div id="stars"></div>';
  form += '  </div>';
  form += '  <div id="submit-container" class="col-sm-5">';
  form += '    <a href="#">Submit</a>';
  form += '  </div>';
  form += '</div>';

  $('#user-review-container').html(form);
  $('#user-review-container').show();

  $("#stars").rating({ min: 0, max: 5, step: 1, showClear: false, size: 'xs' });
  $('#user-review-container .star-rating').on('rating.change', function(event, value, caption) {
    currentMovieRating = value;
  });

  $("#submit-container a").click(function(e) {
    e.preventDefault();
    submitReview();
  });
}

function addUserReview(data) {
  $('#user-review-container').html('');
  $('#user-review-container').hide();

  var review = '<div class="review">';
  review += '  <div class="comment">';
  review += '    <div class="row">';
  review += '      <div class="col-xs-8">';
  review += '        <p class="username">' + data.username + '</p>';
  review += '        <p class="user-comment">' + data.comment + '</p>';
  review += '      </div>';
  review += '      <div class="col-xs-4 rating-container">';
  review += '        <span class="rating">' + data.rating + '<span class="small">/5</span></span>';
  review += '      </div>';
  review += '    </div>';
  review += '  </div>';
  review += '</div>';

  $('#your-review').html(review);
}

function getDuration(minutes) {
  var hours = Math.floor(minutes / 60);          
  var minutes = minutes % 60;

  var duration = '';

  if (hours > 0) { duration += hours + ' hr '; }
  duration += minutes + ' min';

  return duration;
}

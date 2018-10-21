
$(document).ready(function(){

  // Click Listener to add a comment
  $('.addComment-button').on('click', function(){

  
    // Get _id of comment to be deleted
    var id = $(this).data("id");

    // URL root (so it works in eith Local Host for Heroku)
    var baseURL = window.location.origin;

    // Get Form Data by Id
    var name = "form-add-" + id;
    var frm = $('#' + name);


    // AJAX Call to delete Comment
    $.ajax({
      url: baseURL + '/add/' + articleId,
      type: 'POST',
      data: frm.serialize(),
    })
    .done(function() {
      // Refresh the Window after the call is done
      location.reload();
    });
    
    // Prevent Default
    return false;

  });

  // Click Listener to delete a comment 
  $('.deleteComment').on('click', function(){

    // Get _id of comment to be deleted
    var commentId = $(this).data("id");

    // URL root (so it works in eith Local Host for Heroku)
    var baseURL = window.location.origin;

    // AJAX Call to delete Comment
    $.ajax({
      url: baseURL + '/delete/' + commentId,
      type: 'POST',
    })
    .done(function() {
      location.reload();
    });
    
    return false;

  });
  
});


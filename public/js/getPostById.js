$(document).ready(function () {
    // Get the postId from the URL
    const currentUrl = window.location.href;
    const lastSegment = currentUrl.split('/').pop();
    const postId = lastSegment.split('?')[0];

    // What happens when you create a new comment
    $('#newCommentForm').on('submit', function (event) {
        event.preventDefault();

        // Extract postId from the URL 
        const currentUrl = window.location.href;
        const lastSegment = currentUrl.split('/').pop();
        const postId = lastSegment.split('?')[0];

        // Get the content from the textarea
        const content = $('textarea[name="content"]').val();

        // Data to be sent to the API call
        const requestBody = {
            content: content,
            postId: postId
        };

        // Send the POST request 
        $.ajax({
            type: 'POST',
            url: '/users/createComment',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
            success: function (newComment) {
                console.log("New comment", newComment);

                // Append the new comment to the comments list
                $('#commentsList').prepend(`
                <li>
                    <a href="/users/${newComment.userId}">${newComment.user.username}</a> 
                    <br>
                    ${newComment.text}
                    <br>
                    ${newComment.timestamp}
                </li>
            `);
                $('#newCommentForm')[0].reset();
            },
            error: function (err) {
                console.error('Error creating comment:', err);
            }
        });
    });

    // What happens you like a post 
    $('#likeButton').on('click', function () {
        $.ajax({
            type: 'POST',
            url: '/users/addLike',
            data: JSON.stringify({ postId: postId }),
            contentType: 'application/json',
            success: function (response) {
                console.log("Response:\n", response);
                // Update the Like Score
                $('#likeScore').text(response.likeScore);
                // Update the Likes count
                $('#likesCount a').text(response.likes.length);
                // Update the Dislikes count
                $('#dislikesCount a').text(response.post.dislikes.length);
            },
            error: function (err) {
                console.error('Error liking post:', err);
            }
        });
    });

    // What happens when you dislike a post
    $('#dislikeButton').on('click', function () {
        $.ajax({
            type: 'POST',
            url: '/users/addDislike', 
            data: JSON.stringify({ postId: postId }),
            contentType: 'application/json',
            success: function (response) {
                console.log("Response:\n", response);
                // Update the Like Score
                $('#likeScore').text(response.likeScore);
                // Update the Likes count
                $('#likesCount a').text(response.post.likes.length);
                // Update the Dislikes count
                $('#dislikesCount a').text(response.post.dislikes.length);
            },
            error: function (err) {
                console.error('Error disliking post:', err);
            }
        });
    });
});

$(document).ready(function () {
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
                // Assuming newComment contains the necessary fields
                $('ul').append(`
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
});

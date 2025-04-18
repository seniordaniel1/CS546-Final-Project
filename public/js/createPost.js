$(document).ready(function () {
    $('#newPostForm').on('submit', function (event) {
        event.preventDefault();
        const formData = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: '/users/createPost',
            data: formData,
            success: function (newPost) {
                // Append the new post to the posts list
                $('article.post').first().before(`
                        <article class="post">
                            <h2><a href="/posts/${newPost._id}">${newPost.userId}</a></h2>
                            <p>${newPost.content}</p>
                        </article>
                    `);
                $('#newPostForm')[0].reset();
            },
            error: function (err) {
                console.error('Error creating post:', err);
            }
        });
    });
});
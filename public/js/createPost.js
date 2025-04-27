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
        <div class="post-header">
            <img class="post-avatar" src="/assets/default.png" alt="avatar">
            <a class="post-user" href="/users/${newPost.userId}">${newPost.username}</a>
            <span class="post-timestamp">${newPost.timestamp}</span>
        </div>
        <a href="/posts/${newPost._id}" class="post-link">
            <div class="post-content">
                ${newPost.content}
            </div>

            ${newPost.imageUrl ? `<div class="post-image">
                <img src="${newPost.imageUrl}" alt="Post Image">
            </div>` : ``}
            
        </a>
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
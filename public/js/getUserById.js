$(document).ready(function () {
    const userId = $('#follow-btn').data('user-id');

    $('#follow-btn').click(function () {
        // Check if the logged-in user is already following the user
        const isFollowing = $(this).text().trim() === 'Unfollow';

        $.ajax({
            type: 'POST',
            url: `/users/${userId}/${isFollowing ? 'removeFollower' : 'addFollower'}`,
            success: function (response) {
                // Update the followers count
                $('a[href="/users/' + userId + '/followers"]').text(response.newFollowersCount);

                // Toggle button text
                $('#follow-btn').text(isFollowing ? 'Follow' : 'Unfollow');
            },
            error: function (error) {
                console.error('Error updating follower status:', error);
            }
        });
    });
});

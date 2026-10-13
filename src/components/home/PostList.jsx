import PostCard from './PostCard';

function PostList({
  posts,
  currentUser,
  onRequireLogin,
  onPostDeleted,
  onPostUpdated,
}) {
  return (
    <section className="post-list">
      {posts.length === 0 ? (
        <p className="empty-state">
          Belum ada postingan.
        </p>
      ) : (
        <div className="post-list-items">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onRequireLogin={onRequireLogin}
              onPostDeleted={onPostDeleted}
              onPostUpdated={onPostUpdated}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PostList;
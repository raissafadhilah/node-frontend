function TrendingDiscussions({ discussions }) {
  return (
    <section className="trending-discussions">
      <div className="section-heading">
        <h2>Trending Discussions</h2>
        <span className="see-more-button">See more</span>
      </div>

      <div className="trending-discussion-list">
        {discussions.length === 0 ? (
          <div className="empty-state">
            Belum ada trending discussion.
          </div>
        ) : (
          discussions.map((post) => {
            const initials = post.full_name
              ? post.full_name
                  .split(' ')
                  .map((name) => name[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '?';

            return (
              <article
                key={post.id}
                className="trending-discussion-card"
              >
                <div className="discussion-user">
                  <div className="discussion-avatar" aria-hidden="true">
                    {initials}
                  </div>
                  <div>
                    <strong>{post.full_name}</strong>
                    <span>{post.status}</span>
                  </div>
                </div>

                <p className="discussion-content">
                  {post.content}
                </p>

                {post.hashtags?.length > 0 && (
                  <div className="discussion-tags">
                    {post.hashtags.map((hashtag) => (
                      <span key={hashtag}>{hashtag}</span>
                    ))}
                  </div>
                )}

                <div className="discussion-meta">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-5.5A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                  {post.comment_count} balasan
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default TrendingDiscussions; 
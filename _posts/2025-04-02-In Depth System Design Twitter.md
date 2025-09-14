---
layout: post

priority: 0

title: "In Depth System Design Twitter"

permalink: /blog/in-depth-system-design-twitter

logo-light: /logo-tech-light.png
logo-dark: /logo-tech-dark.png

category: general

description: >-
  A Detailed Exploration of User & Social Graph, Content, Feed, Engagement, Media, and Search & Discovery.

meta:
  title: "In Depth System Design Twitter"
  description: >-
    A Detailed Exploration of User & Social Graph, Content, Feed, Engagement, Media, and Search & Discovery.
  image: "/cdn/960/posts/twitter-cover.png"

coach_id: ramesndrakumar

hero:
  title: "In Depth System Design Twitter"
  background-image: /posts/twitter-cover.png
---

You can get System Design of Twitter anywhere but the key focus of this article is the deep dive into core services and the handling of corner cases—a level of detail that goes well beyond what’s typically found in articles elsewhere. While you never know exactly what an interviewer might ask, this in-depth content ensures you’re prepared to navigate unexpected questions and aren’t caught off guard by gaps in generic material. Use what’s most relevant for the interview—but rest assured, the foundation is here.

With my experience conducting over 140 system design interviews on Architect level and 300+ mock interviews on various platforms—consistently rated 5 stars by hundreds of participants—I’m launching a free 3 classes live course to demystify what’s truly expected in system design interviews. This Free course will be available in both IST and PST time zones to accommodate different schedules. If you're interested in joining, you can enroll in this [google form](https://docs.google.com/forms/d/e/1FAIpQLSfW_Hlew_UsGgUIh73cTr4QIndkiVIxqqm9eV1jDxszsSGF0w/viewform?utm_campaign=form_signup&utm_medium=cpc&utm_source=article).

**Below Designs are previously covered topics in this blog:**

[System Design of Uber](https://ramendraparmar.substack.com/p/system-design-of-uber-real-time-location?utm_campaign=blog_promotion&utm_medium=cpc&utm_source=substack)

[System Design of Netflix](https://substack.com/@ramendraparmar/p-158764946?utm_campaign=blog_promotion&utm_medium=cpc&utm_source=substack)

## 1. Understand the Question As a User

**Interviewer:** “What’s the core feature we want to design?”<br>
**Interviewee:** “A large-scale social platform with user profiles, posts, feeds, media, and discovery.”

**Interviewer:** “Which services are most critical to implement first?”<br>
**Interviewee:** “User & Social Graph, Posts, Feeds, Engagement, Media, and Search & Discovery.”

**Interviewer:** “Any specific focus on advanced ranking or basic ordering?”<br>
**Interviewee:** “We’ll do a basic feed approach first, with potential to add ranking signals.”

**Interviewer:** “How will we handle privacy constraints?”<br>
**Interviewee:** “We’ll enforce ACL checks in both the Content Service and Feed generation logic.”

---

## 2. Requirement Gathering

#### 2.1 Functional Requirements (FR)

**1. User Profiles and Relationships**

- Users can create profiles, add friends (Facebook model) or follow/unfollow other users (Twitter model).

- Relationship graphs can be large, with each user potentially following or friending thousands.

**2. Content Creation**

- Users create posts (text, images, videos, links).

- The system must store these in a scalable manner and distribute them to interested parties.

**3. Feed/TIMELINE Generation**

- For each user, show relevant content from the people or pages they follow or are friends with.

- A ranking algorithm might personalize the feed (e.g., by engagement signals, user preferences). Alternatively, for simpler systems, a reverse-chronological feed is used.

**4. Real-Time Updates**

- Newly posted content should appear quickly in followers’ feeds.

- Users should see fresh posts when they open their feed or refresh the page.

**5. Likes, Comments, Shares, Retweets**

- Users can interact with content. The feed should reflect that (e.g., “Alice liked Bob’s post”).

- These signals may affect the ranking or appear as appended info in the feed.

**6. Notifications**

- Users receive notifications for mentions, direct replies, or interactions (likes, shares, retweets).

**7. Search & Discovery**

- Users can search for keywords, hashtags, or topics.

- Might see “Trending topics” or “Suggested content.”

#### 2.2 Non-Functional Requirements (NFR)

**1. Massive Scalability & Low Latency**

- Handle hundreds of millions or billions of active users.

- Potentially billions of daily feed views.

- Keep feed load times to sub-second or a few seconds at worst.

**2. High Availability**

- The platform is global and must remain online 24/7.

- Tolerate regional data center outages.

**3. Security & Privacy**

- Protect user data (profiles, private posts).

- Enforce access controls for each post (who can view or interact).

- Manage large-scale moderation (spam detection, hateful content, etc.).

**4. Global Distribution**

- Deploy data centers in multiple regions to reduce latency.

- Conform to local laws (e.g., GDPR in EU).

**5. Fault Tolerance & Disaster Recovery**

- Survive hardware failures, software bugs, network partitions.

**6. Observability**

- System must be instrumented for logs, metrics, tracing, and real-time anomaly detection.

#### 2.3 Out of Scope

- Advanced real-time video streaming or live stories.

- Very advanced ML-based content ranking (Deep dive on machine learning pipelines might be a separate design).

- Payment or e-commerce features beyond basic ad placements or promotional content.

[Check out more insights on system design here](https://substack.com/@ramendraparmar/p-159545891?utm_campaign=blog_promotion&utm_medium=cpc&utm_source=substack)

<embed src="/images/posts/twitter system design 1.gif" width="700" height="500">

<embed src="/images/posts/twitter system design 2.gif" width="700" height="500">

## 3. Back-of-the-Envelope (BOE) Calculations / Capacity Estimates

Let’s outline hypothetical usage numbers to grasp the scale:

**1. User Base:** 1 billion monthly active users.

**2. Daily Active Users:** 50% might be daily active → 500 million daily.

**3. Average Follow Count:**

- On Twitter, an average user might follow ~100–300 accounts (some extreme outliers follow tens of thousands).

**4. Posts per Day:** On average daily active user creates 1 post or tweet → 500 million posts/day.

**5. Feed Views:** Let’s assume 5 checks/day → 2.5 billion feed requests/day.

**6. Peak Load:** Typically see peak usage in a ~2-hour window. That might be 20% of daily requests in 2 hours → that’s 500 million feed loads in 2 hours → ~70 million feed loads/hour → ~20k feed loads/second (roughly).

**7. Fan-out / Distribution:** For each post, if a user has ~300 followers, we might need to deliver that post to up to 300 feeds → 500 million × 300 = 150 billion feed insertions daily. That’s an extreme case if we do an immediate push model.

**Storage:**

- Each post could be ~300 bytes to a few kilobytes (text, plus references to media). Storing 500 million new posts/day leads to a lot of data. Also consider images, videos stored in a separate media service.

**Takeaway:** The feed fan-out is enormous. We must design a system that can handle billions of write operations daily (inserting new posts into fans’ feeds or storing indexes to pull on read).

---

## 4. Approach (High-Level Design)

#### 4.1 Architecture Overview

A typical large-scale social feed design involves the following high-level components:

**1. User Service**

- Manages user profiles, follow/friend relationships.

**2. Social Graph Service**

- Maintains the graph of who follows whom. Provides queries like “get all followers of user X.”

**3. Content (Post) Service**

- Handles creation, storage, and retrieval of posts.

- Manages associated metadata (timestamps, author ID, privacy level).

**4. Feed Service**

- Generates or retrieves the feed for each user.

- Might do “push” (precompute feed updates whenever a post is created) or “pull” (compute feed at read time) or a hybrid approach.

- Applies any ranking logic.

**5. Engagement/Interaction Service**

- Stores likes, comments, shares, retweets.

- Potentially sends signals back to the Feed Service for re-ranking.

**6. Media Service**

- Manages image/video storage. (Often stored in an Object Storage, e.g. AWS S3 or a custom distributed file system.)

**7. Search & Discovery Service**

- Indexes posts for hashtag/keyword search, trending analysis.

**Important:** At massive scale, data is distributed across multiple regions. We rely on sharding/partitioning for posts, user data, and the social graph to keep performance high.

#### 4.2 Data Consistency vs. Real-Time Updates

- **Post Creation:** Must quickly store the post and either push to follower feeds or mark it for feed generation.

- **Feed Assembly:** Typically an eventually consistent approach is fine. If a post is a few seconds late in your feed, it’s usually acceptable.

- **Ranked Feeds:** We can use near-real-time signals (e.g., a friend’s new post or a popular post going viral) but strict transactional consistency is seldom required.

#### 4.3 Security & Privacy Considerations

- **Access Control:** Each post can be public, friends-only, or a custom list. The feed system must respect these policies.

- **Encryption:** TLS for all communications, plus optional encryption at rest for user data.

- **Compliance:** Must handle user data deletion requests (GDPR “right to be forgotten”), store data regionally if required by local regulations.

---

## 5. Databases & Rationale

#### 5.1 User & Social Graph Service

**Primary Use Case:** Managing user profiles and following/friend relationships.

**Data Store:**

- A relational DB (MySQL/PostgreSQL) or a distributed NoSQL store for user profiles.

- A graph database or adjacency lists (in a NoSQL store like Cassandra) for the follow/friend relationships.

#### 5.2 Content (Post) Service

**Use Case:** Creating/storing textual posts, referencing media.

**Data Store:**

- NoSQL (Cassandra) for massive scale of writes and flexible schema.

- Each post might be stored with fields: postId, authorId, timestamp, body, privacy settings.

- Large media objects stored separately (e.g., in a blob store).

#### 5.3 Feed Service

**Core Challenge:** Efficiently generate or retrieve the feed for each user.

**Push Model (Fan-Out on Write):** When a user posts, we add that post to all followers’ feed timelines in a DB table.

- **Pros:** Faster feed reads, as each user’s feed is precomputed.

- **Cons:** Massive write amplification if a user has many followers. Potentially storing duplicates.

**Pull Model (Fan-Out on Read):** When a user loads their feed, we fetch relevant posts from people they follow, sorted by recency or rank.

- **Pros:** Fewer writes, no storage of duplicates.

- **Cons:** Potentially slower feed read times, especially if a user follows many.

- **Hybrid:** Precompute partial lists for users with fewer followers or high activity, while pulling for others. Or precompute only the top N, then fill the rest on read.

**Data Store:**

- In a push model, we might store a feed table: userId → (postId, authorId, timestamp).

- In a pull model, we need quick queries for “fetch posts from these 300 authors.”

- Often Redis or specialized caching to store recent feed items.

#### 5.4 Engagement/Interaction Service

**Use Case:** Storing likes, comments, shares, retweets at scale.

**Data Store:**

- NoSQL columnar db with counters or a specialized real-time event store to handle high write volume.

- Possibly a relational DB for comment threads (if advanced filtering or indexing needed).

#### 5.6 Media Service

**Use Case:** Storing images, videos, etc.

**Data Store:**

- Typically a distributed file store or an Object Store like S3 or a custom on-prem solution.

- Store metadata (URL, type, size) in a NoSQL KV store DB.

---

## 6. APIs

Here we outline a possible API structure for each microservice, keeping it high-level. Real-world systems might use gRPC or GraphQL, but we’ll illustrate with typical REST-like endpoints.

#### 6.1 User & Social Graph Service

- POST /users

  Payload:`http { name, email, password, profileData... }`

  Response: `http 201 Created { userId }`
  <br>

- GET /users/{userId}

  Response: `http { userId, name, profileInfo, ... }`

#### 6.2 Content (Post) Service

- POST /posts

  Payload: `http { authorId, text, mediaRefs, privacySettings }`

  Response: `http 201 Created { postId, timestamp }`
  <br>

- GET /posts/{postId}

  Response: `http { postId, authorId, text, createdAt, likesCount, ... }`

#### 6.3 Feed Service

- GET /feed/{userId}

  Query Params: `http ?limit=20&offset=0 (or use a pagination token)`

  Response: `http[ { postId, authorId, text, timestamp, ... }, ... ]`
  <br>

- POST /feed/rebuild (Internal)

  Description: Recomputes or updates user feeds.

#### 6.4 Engagement/Interaction Service

- POST `http /posts/{postId}/{like/Comment/Share}`

  Payload: ``http { userId, text(if needed) }```

  Response: `200 OK`

#### 6.5 Media Service

- POST /media/upload

  Payload: Binary file or references.

  Response: `http 200 OK { mediaUrl, mediaId }`
  <br>

- GET /media/{mediaId}

  Redirects to actual storage or returns a signed URL.

#### 6.6 Search & Discovery Service

- GET /search

  Query Params: `http ?q=<keyword>&type=posts|users|hashtags`

  Response: [ results... ]
  <br>

- GET /trending

  Response: `http [ { topic, popularity }, ... ]`

---

## 7. Deep Dive into Core Services

Below, we map each major function to a “core service,” exploring responsibilities, components, corner cases, and possible optimization strategies.

#### A. User & Social Graph Service

**Overview & Responsibilities**
The User & Social Graph Service is responsible for managing all user-related data—profiles, account settings, security credentials—and the social relationships between users, such as **“follows”** on Twitter or **“friend”** connections on Facebook. Key functions include:

**1. User Profile Management**

- Creating and updating basic user information: name, username, profile picture, bio, etc.

- Storing private details such as email addresses or phone numbers in a secure, encrypted manner.

**2. Authentication & Authorization (Basic Handling)**

- Validating user credentials (though full-fledged auth might be a separate Auth Service in some architectures).

- Ensuring only legitimate users or sessions can modify or access specific data.

**3. Social Graph Maintenance**

- Handling **“follow”** actions: user A follows user B.

- Handling **“friend”** actions if a mutual connection model is used, often requiring an acceptance flow.

- Managing lists of followers, following, and potential “friend lists” or **“groups”** for advanced privacy.

**4. APIs for Relationship Lookups**

- Quick retrieval of who a user follows or is followed by (important for feed fan-out logic).

- Potentially advanced queries, such as **“mutual friends”** or **“people you may know”**

**Core Components & Data Structures**

**1. User Database**

Could be a relational DB (e.g., MySQL, PostgreSQL) or a NoSQL store (Cassandra, DynamoDB).

Stores user records keyed by userId with fields for name, contact info, profile metadata.

**2. Social Graph Store**

Adjacency lists in a key-value approach: for each userId, store a sorted list of their followers and a sorted list of those they follow.

Large-scale systems often use NoSQL (like Cassandra or HBase) for constant-time or near-constant-time writes.

**3. Cache Layer**

Redis or Memcached for the most frequently accessed data: popular user profiles, partial adjacency lists for users who are checked frequently.

**4. Access Layer / Microservice Endpoints**

<pre style="background: #f4f4f4; padding: 1em; font-size: 18px; color: #000; border-radius: 5px;">
<code>
- POST /users/{userId}/follow

- DELETE /users/{userId}/follow/{targetId}

- GET /users/{userId}/followers
</code>
</pre>

And so on, to manage relationships.

**Corner Cases & Their Solutions**

**1. Huge Celebrity Accounts**

- **Case:** One user can have tens of millions of followers, making adjacency lists enormous.

- **Solution:**

  - Shard or partition follower lists across multiple physical DB partitions.

  - Store a user’s followers in segments (e.g., `userId:followers:shard_0, userId:followers:shard_1, etc.`).

  - Use caching for the **“hot”** segments that are accessed most.

**2. Mutual Friend vs. One-Way Follow**

- **Case:** In a friend model, both sides must accept. In a follow model, it’s one-directional.

- **Solution:**

- Distinguish states in the graph edges (e.g., pending, accepted).

- When user A sends a friend request, store an edge with status = pending. Once B accepts, mark it status = accepted.

**3. Performance Under Concurrency**

- **Case:** Many concurrent follow/unfollow actions can cause read/write contention.

- **Solution:**

- Use a scalable NoSQL or partitioned relational approach.

- For in-memory concurrency, rely on an efficient locking or compare-and-set approach if using strongly consistent DBs.

#### B. Content (Post) Service

**Overview & Responsibilities**

The Content (Post) Service is central to a social media platform. It handles the creation, storage, and retrieval of posts (text, images, videos, or links). Key operations include:

**1. Post Creation**

- Accepting new posts/tweets/status updates from users.

- Storing text, references to attached media, timestamps, and privacy settings.

**2. Post Retrieval**

- Providing quick access to individual posts by ID (e.g., when a user clicks on a specific link).

- Potentially powering chronological timelines for a user’s profile page (i.e., **“my posts”**).

**3. Metadata Maintenance**

- Timestamps, location data, references to hashtags or mentions.

- Optional advanced attributes like **“mood,” “activity,”** or link previews.

**4. APIs for Other Services**

- The Feed Service calls this to fetch content details when building a user’s feed.

- The Search Service indexes new posts by calling relevant endpoints or ingesting a real-time stream.

**Core Components & Data Structures**

**1. Post Storage**

- Usually in a NoSQL store such as Cassandra, DynamoDB, or HBase to handle massive write throughput and large data volumes.

- Each post record might look like:

- `http { postId: <unique ID>, authorId: <userId>, text: "Hello world!", createdAt: <timestamp>, mediaRefs: [...], privacy: <enum or ACL data>, ... }`

**2. Indexing**

- A secondary index or an entirely separate system for queries like “get the last 20 posts by user X.”

- Often implemented using a table keyed by (authorId, creationTime DESC) so we can quickly fetch a user’s own timeline.

**3. Caching**

- For extremely popular posts, store them in an in-memory solution (e.g., Redis) to reduce DB lookups.

**4. Metadata Enhancers**

- For link previews: a crawler or microservice fetches the target URL’s title, description, image, which is then stored alongside the post.

**Corner Cases & Their Solutions**

**1. Overly Long or Invalid Content**

- **Case:** Users might attempt to post extremely long text or malicious attachments.

- **Solution:**

- Enforce content length checks at API level.

- Validate media file types or use virus scanning.

- Truncate or reject posts exceeding maximum allowed size.

**2. High Write Rates**

- **Case:** During major events, huge spikes in posting can exceed normal throughput.

- **Solution:**

  - Auto-scaling NoSQL clusters or using a high write capacity store.

  - Employ partitioning strategies based on authorId or postId to balance load.

**3. Post Deletions**

- **Case:** A user can delete or edit a post. The system must reflect that across the feed, search, etc.

- **Solution:**

  - Mark posts as deleted = true (soft delete) for quick reversals or auditing.

  - Asynchronously remove from feed caches or search indices.

  - For an edit, store version history or at least a last-updated timestamp.

**4. Reference to Media**

- **Case:** The post references images or videos that may be missing or corrupted.

- **Solution:**

  - Validate media existence at post creation.

  - Provide fallback if the media service is down or the file is removed (e.g., show “media not available”).

#### C. Feed Service

**Overview & Responsibilities**

The Feed Service is the heart of a social network’s user-facing experience. It aggregates relevant posts from the user’s network (friends or followed accounts) and delivers them in a ranked or chronological feed. Key aspects:

**1. Feed Assembly**

- Gathering posts from multiple authors (the user’s follow list).

- Potentially applying ranking algorithms or sorting by recency.

**2. Push vs. Pull Model**

- **Push (Fan-Out on Write):** Each time a user posts, we copy that post to all followers’ feed lists.

- **Pull (Fan-Out on Read):** When a user requests their feed, we dynamically query recent posts from all the people they follow.

**3. Caching & Pagination**

- Storing partial feed data in memory for quick reads.

- Handling “load more” or infinite scrolling with offset or cursor-based pagination.

**4. Integration with Ranking/ML**

- Optional advanced layer to personalize the feed based on engagement signals, user preferences, etc.

**Core Components & Data Structures**

**1. Feed Storage Table**

- In a push model, we might have a table: (userId, postId, timestamp) storing the feed for each user.

- In a pull model, we rely more heavily on the Post Service and a method to quickly merge or gather posts from all followed authors.

**2. Real-Time Updates**

- A queue or event bus that notifies the Feed Service when new posts appear, so it can fan them out if using push.

**3. Ranking Module**

- For a simple chronological feed, this is trivial (sort by timestamp).

- For advanced ranking, we might maintain a separate microservice or library that calculates relevance scores, factoring in user interest, post popularity, etc.

**4. Cache Layer**

- Store the most recent feed items in Redis or another cache, minimizing repeated DB lookups for frequent feed refreshes.

**Corner Cases & Their Solutions**

**1. High-Fan-Out Users**

- **Case:** A user with millions of followers (e.g., a celebrity) creates one post, requiring distribution to all follower feeds. This can create a **“write storm”**

- **Solution:**

  - Pull or Hybrid approach for these specific **“high fan-out”** accounts. Instead of pushing to all followers, we store the post in a special feed source so that followers see it only on read.

  - Use a queue-based approach that trickles the distribution over time, or store only an index referencing the post.

**2. Late Arrivals or Chronological Inconsistency**

- **Case:** If system delays or network issues cause a post to arrive late to the feed, the chronological order can be off.

- **Solution:**

  - Add creationTime to each feed item, always sort by that creationTime (or rank score).

  - Even if an item arrives late, it’s placed correctly in the timeline by the client or server logic.

**3. Feed Ranking vs. Real-Time**

- **Case:** If the feed is heavily ranked based on user behavior, real-time changes (e.g., **“your friend just posted”**) might not appear at the top.

- **Solution:**

  - Maintain a balance of recency and relevance in the ranking function.

  - Provide a toggle for **“most recent”** vs. **“top stories”**

## D. Engagement/Interaction Service

**Overview & Responsibilities**

- Engagement is how users interact with content—likes, comments, shares, retweets, etc. This service captures those events, updates relevant counters, and potentially triggers feed updates or notifications. Key operations:

**1. Likes & Reactions**

- Increment a like counter for a post. Possibly store user IDs of who liked it.

- Some platforms support multiple reaction types (love, angry, wow, etc.).

**2. Comments**

- Store textual responses, often in a threaded or flat format.

- Possibly allow likes on comments or nested replies.

**3. Shares/Retweets**

- Repost content to the user’s own feed, optionally with additional commentary.

**4. Re-Ranking Signals**

- If a post gains a sudden wave of likes/comments, it might be boosted in popularity-based feeds.

**Core Components & Data Structures**

**1. Engagement DB**

- Could be a NoSQL store optimized for high write throughput (since likes and comments can spike rapidly).

- For comments, some use a relational DB if advanced filtering (e.g., “top comments first”) is required.

- Often store counters in a separate column family or row for each post.

**2. Counters**

- Many platforms keep aggregated counters (likeCount, commentCount) for quick display, updated asynchronously or in near-real-time.

- Use atomic increment operations in Cassandra or a distributed lock approach if strong consistency is needed.

**3. Comment Threads**

- Data structure can be hierarchical if nested comments are allowed.

- Alternatively, store a flat list with parentCommentId references for partial nesting.

**4. Event/Queue for Notifications**

- An event bus that publishes: “User X liked post Y,” “User A commented on post B,” etc.

- Other services (Notifications, possibly ranking engines) consume these events.

**Corner Cases & Their Solutions**

**1. Concurrent Likes**

- **Case:** Thousands of people might like the same post within seconds, risking concurrency conflicts on counters.

- **Solution:**

  - Use a distributed counter approach with eventual consistency (e.g., in Cassandra or DynamoDB’s atomic updates).

**2. Comment Flood / Spam**

- **Case:** A controversial post might receive thousands of comments per minute, or spammers flood the comment system.

- **Solution:**

  - Introduce rate limits or captcha challenges, spam detection ML or heuristics for suspicious comment volume.

**3. Nested Replies**

- **Case:** Deeply nested threads can become difficult to store or render.

- **Solution:**

  - Impose a maximum depth (e.g., 3 or 4 levels). If deeper nesting is needed, flatten further replies or link to them.

  - Use a tree data structure or store parentId references and limit expansions in the UI.

#### E. Media Service

**Overview & Responsibilities**

Modern social platforms revolve around visual or audiovisual content—images, GIFs, short videos, live streams. The Media Service handles uploading, storage, and serving these media assets:

**1. Upload Management**

- Accepts file uploads (images, videos) and stores them in an underlying object store.

- May perform compression, transcoding, or thumbnail generation.

**2. URL Generation**

- Provides secure URLs or CDN endpoints for accessing these files.

- Might produce temporary signed URLs that expire for private or sensitive content.

**3. Metadata & Indexing**

- Maintains metadata in a database: file size, MIME type, creation date, or user ownership.

**4. Integration with Post/Content**

- The Post Service references the media IDs or URLs in the post record.

**Core Components & Data Structures**

**1. Object Storage / File Store**

- Could be Amazon S3, Google Cloud Storage, or an on-prem distributed solution like Ceph, GlusterFS, or HDFS.

- Provides durability (multiple replicas) and high throughput for large volumes of media.

**2. Media Metadata DB**

- A relational or NoSQL table storing the mapping mediaId -> { userId, type, path, size, etc. }.

- Potentially an index on userId for user’s media library.

**3. CDN (Content Delivery Network)**

- Geo-distributed caching to serve images/videos quickly worldwide.

- Reduces latency and relieves origin servers from direct load.

**4. Transformation Pipelines**

- **For images:** generate thumbnails or multiple resolutions.

- **For videos:** transcode to different bitrates, create previews, handle adaptive streaming.

**Corner Cases & Their Solutions**

**1. Large File Uploads / Videos**

- **Case:** Users may upload large videos or high-resolution photos beyond typical size limits.

- **Solution:**

  - Break large uploads into chunks, process them incrementally (multi-part upload).

**2. Storage Costs**

- **Case:** Over time, storing billions of media files becomes very expensive.

- **Solution:**

  - Life-cycle policies to move older content to cheaper “cold storage.”

  - “Delete or archive after X years” if user is inactive (provided it meets policy and user TOS).

**3. Broken Links or Missing Media**

- **Case:** A post references a mediaId that no longer exists (deleted or never fully uploaded).

- **Solution:**

  - When the Post Service finalizes a post, confirm that the media files are valid.

**4. CDN Cache Invalidation**

- **Case:** A user replaces or edits an uploaded image, but the CDN still serves the old version.

- **Solution:**

  - Versioned URLs. Each update leads to a new versioned path, ensuring caches get fresh data.

#### F. Search & Discovery Service

**Overview & Responsibilities**

Search & Discovery helps users find posts, profiles, hashtags, or trending topics. It typically does more than simple keyword matching; it might factor in user preferences, popularity signals, or advanced ranking. Key operations include:

**1. Indexing New Content**

- Whenever a new post is created or updated, the service ingests that data into a search index (e.g., Elasticsearch).

- Potentially handle hashtags, mentions, or metadata for quick lookups.

**2. Retrieving Results**

- Provide an API to search by keywords, hashtags, or user handles.

- Return relevant or time-sorted posts.

**3. Trending/Popular Topics**

- Analyzing real-time data to see which keywords or hashtags are surging in usage.

- Potentially surface these as “trending now” or “what’s happening.”

**4. User Discovery**

- Suggest new users to follow, often factoring in user’s social graph adjacency, interests, or geolocation.

**Core Components & Data Structures**

**1. Search Engine**

- Commonly Elasticsearch or Apache Solr for large-scale text indexing.

- Ingestes post text, user bios, tags, and more.

**2. Ingestion Pipeline**

- Possibly a Kafka stream or real-time event pipeline from the Post Service and Engagement Service.

- Processes the raw data, normalizes it, then indexes it in the search cluster.

**3. Analytics for Trending**

- Real-time counters or time-window-based approach to see which tags or words spike in usage.

- Could integrate with a separate analytics store or real-time streaming job (e.g., Spark Streaming, Flink).

**4. Query Service**

- A microservice that receives GET /search?q=... requests, translates them to search engine queries, formats the results, and returns them to the client.

**Corner Cases & Their Solutions**

**1. Index Lag**

- **Case:** A user posts something, but it takes too long (minutes or hours) to appear in search results.

- **Solution:**

  - A near-real-time indexing pipeline.

  - Elasticsearch can commit near-real-time segments, ensuring new documents appear in seconds.

  - For urgent or trending hashtags, use a high-priority stream that commits faster.

**2. Relevancy & Ranking**

- **Case:** Basic keyword matching might return irrelevant or low-quality results.

- **Solution:**

  - Use advanced ranking with TF-IDF, BM25, or vector-based retrieval.

  - Incorporate engagement signals (likeCount, shareCount) to boost popular posts.

**3. Spam / Offensive Content**

- **Case:** Attackers flood the platform with spammy keywords or malicious links, hoping to hijack search results.

- **Solution:**

  - Real-time spam detection that flags or removes such content before indexing.

  - Weighted scoring that lowers rank of new or suspicious accounts.

**4. Overloaded Queries**

- **Case:** Very broad or complex queries might degrade search cluster performance.

- **Solution:**

  - Enforce query timeouts or complexity limits.

  - Add caching layers for popular queries.

  - Shard the index to scale horizontally.

**5. Personalized Results**

- **Case:** A user might expect results tailored to their location or interests.

- **Solution:**

  - Add user-level preference data or friend/follow signals in the ranking function.

  - Possibly store personalization data in a separate index or user vector representation.

---

## 8. Bonus Read: Push vs. Pull Models for Feeds

A key design decision in feed systems is whether to push posts to followers at creation time or to pull them at read time.

**1. Push (Fan-Out on Write)**

- **Workflow:** When a user posts, the system retrieves all followers and inserts the post ID into each follower’s feed list.

- **Pros:** Quick read times (already stored in follower feeds).

- **Cons:** Potentially huge write amplification if a user has millions of followers. Also wasteful if many followers are inactive.

**2. Pull (Fan-Out on Read)**

- **Workflow:** When a user requests their feed, the system aggregates posts from the users they follow, sorts them, and returns them.

- **Pros:** Lower write overhead; no duplication for each follower.

- **Cons:** Potentially slower read times if you must merge many authors’ posts. High CPU usage at read time.

**3. Hybrid**

- **Approach:** Precompute feed for average user who has a moderate follower count. For extremely large or celebrity accounts, you might store only recent posts or do partial distribution.

- **Goal:** Balance read and write costs.

Modern social networks often adopt the hybrid approach, using caching, partial distribution, and real-time ranking.

---

## 9. Addressing Non-Functional Requirements (NFRs)

#### A. Scalability & High Availability

- **Partitioning:**

  - Users, posts, social graph data must be sharded across multiple machines or data centers.

- **Caching:**

  - In-memory caches [Redis](https://redis.io/?utm_campaign=blog_promotion&utm_medium=cpc&utm_source=article) for hot feeds, hot posts, or frequently accessed user profiles.

- **Load Balancers:**

  - Route requests to multiple service replicas, scale horizontally.

- **Microservices:**

  - Deploy each in containers [Docker](https://www.docker.com/?utm_campaign=blog_promotion&utm_medium=cpc&utm_source=article) or orchestrators ([Kubernetes](https://kubernetes.io/?utm_campaign=blog_promotion&utm_medium=cpc&utm_source=article)/ECS) with auto-scaling.

#### B. Security & Privacy

- **Access Control:**

  - Check user relationship and post privacy before displaying in feed.

- **Encryption:**

  - TLS for data in transit, encrypt personal data at rest.

- **Spam & Abuse:**

  - Use moderation pipelines, user reporting, machine learning classification for abusive content.

#### C. Global Distribution & Data Locality

- **Regional Data Centers:**

  - Store user data in the region closest to them. Helps reduce latency.

- **User Partition:**

  - Possibly keep a user’s data in one region, replicate partial data as needed.

#### D. Fault Tolerance & Disaster Recovery

- **Multi-Region Replication:**

  - If one region fails, direct traffic to another.

- **Backups & Snapshots:**

  - Regular backups of user data, adjacency lists, feed data.

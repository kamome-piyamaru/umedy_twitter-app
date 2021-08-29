import React, { useState, useEffect } from "react";
import styles from "./Feed.module.css";
import { db } from "../firebase";
import TweetInput from "./TweetInput";
import Post from "./Post";

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: "",
      avatar: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
      uid: "", //kamome
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .orderBy("timestamp", "desc") // 新しいものが先頭になる
      .onSnapshot((snapshot) =>
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            image: doc.data().image,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            username: doc.data().username,
            uid: doc.data().uid,
          }))
        )
      );
    return () => {
      unSub(); // cleanup
    };
  }, []); // 第2引数がからなので最初にい回だけ実行される

  return (
    <div className={styles.feed}>
      <TweetInput />
      {posts[0]?.id && ( // 投稿が存在するときのみ
        <>
          {posts.map((post) => (
            <Post
              key={post.id}
              postId={post.id}
              avatar={post.avatar}
              image={post.image}
              text={post.text}
              timestamp={post.timestamp}
              username={post.username}
              uid={post.uid} // kamome
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Feed;

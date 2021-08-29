import React, { useState } from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { storage, db, auth } from "../firebase";
import { Avatar, Button, IconButton } from "@material-ui/core";
import firebase from "firebase/app"; // firease からタイムスタンプを取得する
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ブラウザがリフレッシュすることを抑制する
    // 画像有り無しで処理を分岐する
    if (tweetImage) {
      // fileName はユニークである必要があるためランダムに生成する
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      // ランダムな16文字を生成する
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);

      // storage に対して何らかの変化があった時に後処理を行う関数
      uploadTweetImg.on(
        firebase.storage.TaskEvent.STATE_CHANGED,

        // 投稿の進捗状態（Progress）
        () => {}, // 今回は何もしない
        // エラー時
        (err) => {
          alert(err.message);
        },
        async () => {
          // 正常終了した場合
          // アップロードした画像のURLを取得する
          await storage
            .ref("images")
            .child(fileName)
            .getDownloadURL()
            .then(async (url) => {
              await db.collection("posts").add({
                avatar: user.photoUrl,
                image: url,
                text: tweetMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName,
                uid: user.uid, // 投稿者のUIDも入れるべき！
              });
            });
        }
      );
    } else {
      // コレクション名（posts）にオブジェクトを追加する
      db.collection("posts").add({
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
        uid: user.uid, // 投稿者のUIDも入れるべき！
      });
    }
    // 投稿が完了するとTweetメッセージと画像を初期化する
    setTweetImage(null);
    setTweetMsg("");
  };
  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />

          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddAPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;

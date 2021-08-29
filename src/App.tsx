import React, { useEffect } from "react";
import styles from "./App.module.css";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
import Feed from "./components/Feed";
import Auth from "./components/Auth";

const App: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    // userの状態を監視する
    const unSub = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        dispatch(logout());
      }
    });
    // cleanup処理
    return () => {
      unSub();
    };
  }, [dispatch]); //useEffectの第２引数に dispatch を指定
  return (
    <>
      {user.uid ? (
        // userが存在するとき Feedコンポーネントが呼び出される
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        // userが存在しないとき Authコンポーネントが呼び出される
        <Auth />
      )}
    </>
  );
};

export default App;

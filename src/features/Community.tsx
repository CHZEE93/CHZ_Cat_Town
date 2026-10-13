import { Modal } from "../components/Modal";
export { Board } from "./board/Board";
export { Shop } from "./shop/Shop";
export { Profile } from "./profile/Profile";
export function Guide() {
  return (
    <Modal title="천천히, 둘러보세요" eyebrow="WELCOME TO THE NEIGHBORHOOD">
      <p className="muted">정해진 목표도, 서두를 이유도 없어요.</p>
      <div className="guide-row">
        <kbd>W A S D</kbd>
        <span>또는 방향키로 화면 방향에 맞춰 걸어요.</span>
      </div>
      <div className="guide-row">
        <kbd>E</kbd>
        <span>게시판, 상점, 집 앞에서 상호작용해요.</span>
      </div>
      <div className="guide-row">
        <kbd>ESC</kbd>
        <span>창을 닫고 다시 산책해요.</span>
      </div>
      <div className="notice">
        키보드가 있는 데스크톱 브라우저에 맞춘 싱글 플레이 프로토타입입니다.
      </div>
    </Modal>
  );
}

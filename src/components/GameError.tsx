import { useEffect } from "react";
import { useUI } from "../stores/ui";
export function GameError() {
  useEffect(() => {
    useUI.getState().setReady();
  }, []);
  return (
    <div className="game-error" role="alert">
      <strong>3D 마을을 불러오지 못했어요.</strong>
      <p>WebGL 지원과 브라우저 하드웨어 가속 설정을 확인해 주세요.</p>
      <button onClick={() => location.reload()}>다시 불러오기</button>
    </div>
  );
}

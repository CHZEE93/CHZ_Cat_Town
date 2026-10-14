export const REWARD_PLACES = [
  {
    id: "plaza",
    position: { x: 3, z: 0 },
    label: "광장 산책 도장",
    kind: "stamp",
  },
  {
    id: "park",
    position: { x: -22, z: 5 },
    label: "공원 산책 도장",
    kind: "stamp",
  },
  {
    id: "garden",
    position: { x: 24, z: -12 },
    label: "정원 산책 도장",
    kind: "stamp",
  },
  {
    id: "postman",
    position: { x: -5, z: -2 },
    label: "우체부 모찌와 이야기",
    kind: "postman",
  },
  {
    id: "merchant",
    position: { x: 10, z: 5.5 },
    label: "상점 주인 참치와 이야기",
    kind: "merchant",
  },
  {
    id: "home_mailbox",
    position: { x: -3, z: -9 },
    label: "집 옆 우편함에 편지 배달",
    kind: "mailbox",
  },
  {
    id: "garden_drop",
    position: { x: 24, z: -9 },
    label: "정원 배달대에 물품 전달",
    kind: "delivery",
  },
] as const;

// Replace these async methods with fetch calls when the FastAPI service is ready.
export const townService = {
  posts: async () => [
    {
      id: 1,
      category: "인사",
      title: "오늘 처음 왔어요!",
      author: "모찌",
      time: "방금 전",
      body: "작고 포근한 마을이네요. 앞으로 잘 부탁해요!",
    },
    {
      id: 2,
      category: "일상",
      title: "생선 좋아하는 고양이?",
      author: "참치",
      time: "12분 전",
      body: "오늘 저녁은 역시 생선! 다들 어떤 생선을 좋아하나요?",
    },
    {
      id: 3,
      category: "모임",
      title: "광장에서 같이 놀아요",
      author: "나비",
      time: "32분 전",
      body: "분수 옆에서 햇살을 쬐고 있어요. 잠깐 쉬어 가요.",
    },
    {
      id: 4,
      category: "인사",
      title: "새로 이사왔습니다",
      author: "두부",
      time: "1시간 전",
      body: "이웃 고양이 여러분 반가워요. 천천히 마을을 둘러보고 있어요.",
    },
  ],
  products: async () => [
    {
      id: 1,
      icon: "🐟",
      name: "생선",
      description: "오늘도 신선한 한 끼",
      price: 100,
    },
    {
      id: 2,
      icon: "🧶",
      name: "털실공",
      description: "데굴데굴, 작은 즐거움",
      price: 50,
    },
    {
      id: 3,
      icon: "🐾",
      name: "발바닥 쿠션",
      description: "낮잠을 위한 포근한 자리",
      price: 150,
    },
    {
      id: 4,
      icon: "🎀",
      name: "리본",
      description: "평범한 하루에 작은 포인트",
      price: 200,
    },
  ],
  profile: async () => ({
    nickname: "CHZ",
    catType: "Orange Cat",
    since: "2026",
    status: "Exploring Cat Town",
  }),
};

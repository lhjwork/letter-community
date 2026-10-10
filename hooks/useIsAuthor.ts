/** 작성자 여부는 서버가 viewer 기준으로 계산해 내려준다(GET /api/letters/:id 의 isAuthor). 클라이언트에 작성자 ID 는 오지 않는다 */
export function useIsAuthor(letter: { isAuthor?: boolean }) {
  return { isAuthor: !!letter.isAuthor };
}

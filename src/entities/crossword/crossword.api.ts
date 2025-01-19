import { createClient } from "@supabase/supabase-js";
import type { Channel, ChannelItem } from "./crossword.types";
const supabaseUrl = "https://maqmpaflddulznrktwrh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const getWord = async () => {
  const consonants = [
    "ㄱ",
    "ㄴ",
    "ㄷ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅅ",
    "ㅇ",
    "ㅈ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  const vowels = ["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ"];

  const baseUrl = "https://stdict.korean.go.kr/api/search.do";

  const key = process.env.KEY ?? "";

  const params = {
    key: key,
    q: "가능",
    req_type: "json",
    num: "50",
    type1: "word",
    advanced: "y",
    method: "include",
    pos: "1",
  };

  try {
    const WORD_DB = "wordDB";
    const paramsQueryString = new URLSearchParams(params).toString();
    const url = `${baseUrl}?${paramsQueryString}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("데이터 처리 중 에러가 발생했습니다. : `${res.status)}`");
    }

    const data = await res.json();
    const item: ChannelItem[] = data.channel.item;

    console.log(item, "item");

    // const { data, error } = await supabase.from(WORD_DB).insert([
    //   {
    //     id: 1,
    //     word: "테스트",
    //     desc: "테스트 설명",
    //     length: 3,
    //     pos: "명사",
    //     target_code: "104",
    //   },
    // ]);
  } catch (error) {
    if (error instanceof TypeError) {
      // 네트워크 , cors 에러
      console.error("네트워크 오류가 발생했습니다:", error.message);
      throw new Error("API 연결에 실패했습니다. 네트워크 상태를 확인해주세요.");
    }

    if (error instanceof SyntaxError) {
      // JSON 파싱 오류
      console.error("JSON 파싱 오류가 발생했습니다:", error.message);
      throw new Error("서버 응답을 처리하는 중 오류가 발생했습니다.");
    }

    // 기타 예상치 못한 오류
    console.error("예상치 못한 오류가 발생했습니다:", error);
    throw new Error(
      "서비스 이용 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
};
// 반환값의 타입 정의
interface ProcessedWord {
  word: string;
  length: number;
}

// 원하는 조건으로 단어를 정제하는 함수
function processWord(word: string): ProcessedWord | null {
  word = word.trim();

  // 자음만 있는지 확인 (ㄱ-ㅎ)
  const consonantMixed = /[ㄱ-ㅎ]/.test(word);

  if (consonantMixed) {
    return null;
  }

  // 한글 완성형 문자(가-힣)만 남기고 제거
  const result = word.replace(/[^가-힣]/g, "");
  const length = result.length;

  if (length > 7 || length < 2) {
    return null;
  }

  return {
    word: result,
    length: length,
  };
}
// 입력값의 타입 정의
interface SenseInfo {
  definition: string;
  type: string;
  pos?: string | null;
}

// 반환값의 타입 정의
interface ProcessedSense {
  definition: string;
  pos: string;
}

function processSenseInfo(senseInfo: SenseInfo): ProcessedSense | null {
  const definition = senseInfo.definition.trim();
  const wordType = senseInfo.type.trim();
  const pos = senseInfo.pos;

  if (!pos || pos === "품사 없음") {
    return null;
  }

  const posStr = pos.trim();

  if (wordType === "방언" || wordType === "북한어") {
    return null;
  }

  if (
    definition.length > 200 ||
    definition.includes("&") ||
    definition.includes("img") ||
    definition.includes("<FL>") ||
    definition.includes("규범 표기") ||
    definition.includes("준말") ||
    definition.includes("옛말") ||
    definition.includes("-")
  ) {
    return null;
  }

  return {
    definition: definition,
    pos: posStr,
  };
}

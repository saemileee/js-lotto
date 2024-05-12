import Lotto from "../src/domain/Lotto";
import LottoChecker from "../src/domain/LottoChecker";

describe("Lotto Checker", () => {
  let lottoChecker;

  beforeEach(() => {
    const prizeInfo = [
      {
        rank: 1,
        matchingNumberCount: 6,
        bonusAffectsWinning: false,
        reward: 2000000000,
      },
      {
        rank: 2,
        matchingNumberCount: 5,
        bonusAffectsWinning: true,
        reward: 30000000,
      },
      {
        rank: 3,
        matchingNumberCount: 5,
        bonusAffectsWinning: false,
        reward: 1500000,
      },
      {
        rank: 4,
        matchingNumberCount: 4,
        bonusAffectsWinning: false,
        reward: 50000,
      },
      {
        rank: 5,
        matchingNumberCount: 3,
        bonusAffectsWinning: false,
        reward: 5000,
      },
    ];

    lottoChecker = new LottoChecker(prizeInfo);
  });

  afterEach(() => {
    lottoChecker = null;
  });

  describe("유효한 로또 당첨 번호를 입력받는다.", () => {
    describe("로또의 번호는 6개, 보너스 번호는 한 개이다.", () => {
      test.each([
        [5, [1, 2, 3, 4, 5]],
        [7, [1, 2, 3, 4, 5, 6, 7]],
      ])("당첨 번호가 %s개이면 에러를 던진다.", (_, numbers) => {
        // when
        const setLottoNumberInfo = () =>
          lottoChecker.setLottoNumberInfo(numbers, 1);

        // then
        expect(() => setLottoNumberInfo()).toThrow(Error);
      });

      describe("로또의 번호는 1부터 45까지의 자연수이다.", () => {
        test.each([-1, 0, 46, 1.3])(
          "당첨번호에 %s가 있는 경우 에러를 던진다.",
          (number) => {
            // when
            const setLottoNumberInfo = () =>
              lottoChecker.setLottoNumberInfo([1, 2, 3, 4, number, 6], 1);

            // then
            expect(() => setLottoNumberInfo()).toThrow(Error);
          }
        );

        test.each([-1, 0, 46, 1.3])(
          "보너스 번호에 %s가 있는 경우 에러를 던진다.",
          (number) => {
            // when
            const setLottoNumberInfo = () =>
              lottoChecker.setLottoNumberInfo([1, 2, 3, 4, 5, 6], number);

            // then
            expect(() => setLottoNumberInfo()).toThrow(Error);
          }
        );
      });

      describe("로또의 번호는 중복되지 않는다.", () => {
        test("당첨 번호에 중복이 있는 경우 에러를 던진다.", () => {
          // when
          const setLottoNumberInfo = () =>
            lottoChecker.setLottoNumberInfo([1, 2, 3, 4, 5, 4], 7);

          // then
          expect(() => setLottoNumberInfo()).toThrow(Error);
        });

        test("보너스 번호와 당첨 번호에가 중복이 있는 경우 에러를 던진다.", () => {
          // when
          const setLottoNumberInfo = () =>
            lottoChecker.setLottoNumberInfo([1, 2, 3, 4, 5, 6], 5);

          // then
          expect(() => setLottoNumberInfo()).toThrow(Error);
        });
      });

      test("로또 당첨 결과 확인 전에 당첨 번호와 보너스 번호를 설정하지 않으면 에러를 던진다.", () => {
        // given
        const lotto = new Lotto([1, 2, 3, 4, 5, 6]);

        // when
        const checkLotto = () => lottoChecker.checkLotto(lotto);

        // then
        expect(() => checkLotto()).toThrow(Error);
      });
    });

    describe("로또의 당첨 결과를 확인할 수 있다.", () => {
      beforeEach(() => {
        const lottoNumberInfo = {
          winningNumbers: [1, 2, 3, 4, 5, 6],
          bonusNumber: 7,
        };

        lottoChecker.lottoNumberInfo = lottoNumberInfo;
      });

      test("로또 번호가 6개가 일치하면 2000000000을 상금으로 받는다.", () => {
        // when
        const lotto = new Lotto([1, 2, 3, 4, 5, 6]);
        const { matchedWinningNumberCount, isBonusNumberMatched, prize } =
          lottoChecker.checkLotto(lotto);

        // then
        expect(matchedWinningNumberCount).toBe(6);
        expect(isBonusNumberMatched).toBeFalsy();
        expect(prize.rank).toBe(1);
        expect(prize.matchingNumberCount).toBe(6);
        expect(prize.bonusAffectsWinning).toBeFalsy();
        expect(prize.reward).toBe(2000000000);
      });

      test("로또 번호가 5개 + 보너스 번호 1개가 일치하면 30,000,000원 상금을 받는다.", () => {
        // when
        const lotto = new Lotto([1, 2, 3, 4, 5, 7]);
        const { matchedWinningNumberCount, isBonusNumberMatched, prize } =
          lottoChecker.checkLotto(lotto);

        // then
        expect(matchedWinningNumberCount).toBe(5);
        expect(isBonusNumberMatched).toBeTruthy();
        expect(prize.rank).toBe(2);
        expect(prize.matchingNumberCount).toBe(5);
        expect(prize.bonusAffectsWinning).toBeTruthy();
        expect(prize.reward).toBe(30000000);
      });

      test("로또 번호 3개 + 보너스 번호 1개가 일치하면 5,000원 상금을 받는다.", () => {
        // when
        const lotto = new Lotto([1, 2, 3, 7, 8, 9]);
        const { matchedWinningNumberCount, isBonusNumberMatched, prize } =
          lottoChecker.checkLotto(lotto);

        // then
        expect(matchedWinningNumberCount).toBe(3);
        expect(isBonusNumberMatched).toBeTruthy();
        expect(prize.rank).toBe(5);
        expect(prize.matchingNumberCount).toBe(3);
        expect(prize.bonusAffectsWinning).toBeFalsy();
        expect(prize.reward).toBe(5000);
      });

      test("로또 번호가 2개 일치, 보너스 번호 1개 일치하는 경우에는 상금이 없다.", () => {
        // when
        const lotto = new Lotto([45, 7, 43, 42, 2, 1]);
        const { matchedWinningNumberCount, isBonusNumberMatched, prize } =
          lottoChecker.checkLotto(lotto);

        // then
        expect(matchedWinningNumberCount).toBe(2);
        expect(isBonusNumberMatched).toBeTruthy();
        expect(prize).toBeUndefined();
      });

      test("로또 번호가 모두 일치 하지 않는 경우에는 상금이 없다.", () => {
        // when
        const lotto = new Lotto([45, 44, 43, 42, 41, 30]);
        const { matchedWinningNumberCount, isBonusNumberMatched, prize } =
          lottoChecker.checkLotto(lotto);

        // then
        expect(matchedWinningNumberCount).toBe(0);
        expect(isBonusNumberMatched).toBeFalsy();
        expect(prize).toBeUndefined();
      });
    });
  });

  describe("여러장의 로또 당첨 결과를 확인할 수 있다.", () => {
    test("로또 등수 별 몇 장의 로또가 당첨되었는지 확인할 수 있다.", () => {
      // given
      lottoChecker.lottoNumberInfo = {
        winningNumbers: [1, 2, 3, 4, 5, 6],
        bonusNumber: 7,
      };

      const lotto1 = new Lotto([1, 2, 3, 4, 5, 6]); //1등
      const lotto2 = new Lotto([1, 2, 3, 4, 5, 7]); //2등
      const lotto3 = new Lotto([1, 2, 3, 4, 5, 9]); //3등
      const lotto4 = new Lotto([1, 2, 3, 4, 7, 8]); //4등
      const lotto5 = new Lotto([1, 2, 3, 7, 8, 9]); //5등
      const lotto6 = new Lotto([1, 2, 7, 8, 9, 10]); //꽝
      const lotto7 = new Lotto([1, 7, 8, 9, 10, 11]); //꽝
      const lotto8 = new Lotto([7, 8, 9, 10, 11, 12]); //꽝

      const lottoList = [
        lotto1,
        lotto2,
        lotto3,
        lotto4,
        lotto5,
        lotto6,
        lotto7,
        lotto8,
      ];

      // when
      const { lottoAmount, winningDataPerRank, totalRewards } =
        lottoChecker.checkWinningData(lottoList);

      // then
      expect(lottoAmount).toEqual(8);
      expect(winningDataPerRank[1].winningCount).toEqual(1);
      expect(winningDataPerRank[2].winningCount).toEqual(1);
      expect(winningDataPerRank[3].winningCount).toEqual(1);
      expect(winningDataPerRank[4].winningCount).toEqual(1);
      expect(winningDataPerRank[5].winningCount).toEqual(1);
      expect(totalRewards).toEqual(2031555000);
    });
  });
});

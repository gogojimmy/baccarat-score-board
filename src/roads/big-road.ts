import { GameResult, PairResult, RoundResult } from '../round-result';
import { Road, RoadArray } from './road';
import { wrapColumn, wrapRow } from './shared';

export type BigRoadItem = {
  order: number; // 用于折行后确认先后关系
  result: number;
  gameResult: GameResult.BankerWin | GameResult.PlayerWin;
  pairResult: PairResult;
  tieCount: number;
};

/**
 * 根据baccaratItemList生成bigRoad所需一维数据
 */
function generateBigRoadItemList(
  this: void,
  roundResults: ReadonlyArray<RoundResult>,
): ReadonlyArray<BigRoadItem> {
  let arr = new Array<BigRoadItem>();
  roundResults.map((res, index) => {
    if (res.gameResult === GameResult.Tie && arr[index - 1] !== undefined) {
      arr[index - 1].tieCount += 1;
    } else if (res.gameResult !== GameResult.Tie) {
      arr.push({
        order: res.order,
        result: res.result,
        gameResult: res.gameResult,
        tieCount: 0,
        pairResult: res.pairResult,
      });
    }
  });
  return arr.filter(
    (result): result is BigRoadItem => typeof result !== 'undefined',
  );
}

/**
 * 生成bigRoad对应的二维数组
 */
function generateBigRoadGraph(
  this: void,
  roundResults: ReadonlyArray<RoundResult>,
  rowCount: number,
  columnCount: number,
): RoadArray<BigRoadItem> {
  return wrapRow(
    wrapColumn(
      generateBigRoadItemList(roundResults),
      (previousItem, currentItem) =>
        previousItem.gameResult === currentItem.gameResult,
    ),
    rowCount,
    columnCount,
  );
}

export class BigRoad extends Road<BigRoadItem> {
  protected readonly array: RoadArray<BigRoadItem>;

  // Todo: simplify
  public constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    this.array = generateBigRoadGraph(roundResults, row, column);
  }
}

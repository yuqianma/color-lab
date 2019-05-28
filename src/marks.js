import { StoreContext } from './store-context.js';
const { useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

const PROVINCES = '北京市,天津市,上海市,重庆市,河北省,山西省,辽宁省,吉林省,黑龙江省,江苏省,浙江省,安徽省,福建省,江西省,山东省,河南省,湖北省,湖南省,广东省,海南省,四川省,贵州省,云南省,陕西省,甘肃省,青海省,台湾省,内蒙古自治区,广西壮族自治区,西藏自治区,宁夏回族自治区,新疆维吾尔自治区,香港特别行政区,澳门特别行政区'.split(',');

const STYLE = `
.marks {
  margin-left: 20px;
}
.marks .box {
  border: 1px solid #aaa;
  padding: 10px;
  height: 400px;
}
.marks .box .texts {
  width: 100px;
  float: left;
}
.marks .box .text {
}
.marks .box .bars {
  float: left;
}
.marks .box .bar {
  width: 100px;
  height: 30px;
}
`;

export const Marks = ({
  width = 300,
}) => {
  const { state, dispatch } = useContext(StoreContext);
  const { palette, editingIdx } = state;
  return html`<div
    class="marks"
    style=${{ width }}
  >
    <style>${STYLE}</style>
    <div class="title">Marks</div>
    <div class="box">
      <div class="texts">
        ${palette.map((c, idx) => {
          return html`<div class="text" style=${{
            color: c.hex(),
            fontWeight: editingIdx === idx ? 'bolder' : 'normal'
          }}>${PROVINCES[idx]}</div>`;
        })}
      </div>
      <div class="bars">
        ${palette.map((c, idx) => {
          return html`<div class="bar" style=${{
            background: c.hex(),
            marginLeft: editingIdx === idx ? 5 : 0
          }}></div>`;
        })}
      </div>
    </div>
  </div>`;
};

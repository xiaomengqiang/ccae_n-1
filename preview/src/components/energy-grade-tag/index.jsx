const GRADE_NAMES = ["绿算", "正常", "未达标"];
const GRADE_COLORS = ["#26b9b0", "#3ac58d", "#ef535b"];

export function gradeOf(data) {
  const size = Number((data.name || "").match(/-(\d+(?:\.\d+)?)B/i)?.[1] || 0);
  const limits = size >= 70 ? [12, 30] : size >= 14 ? [3, 8] : [1, 2.5];
  const value = Number(data.energyUnit ?? 1.82);
  return data.energySaving ? 1 : value < limits[0] ? 0 : value <= limits[1] ? 1 : 2;
}

// 绿算等级徽标（原 window.energyGradeTag 的 React 版）
export default function EnergyGradeTag({ data }) {
  const grade = gradeOf(data);
  return (
    <span className="hc-ept-grade" style={{ "--ept-grade-color": GRADE_COLORS[grade] }}>
      {GRADE_NAMES[grade]}
    </span>
  );
}

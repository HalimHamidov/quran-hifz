// Boundaries are supplied and attested by the learner's teacher, never inferred by word count.
export function createParts(original, input, approvedAt) {
  const lines=input.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(lines.length<2||lines.length>30)throw Error('Нужно от 2 до 30 проверенных частей, каждая на отдельной строке.');
  let cursor=0;
  const parts=lines.map(line=>{
    while(/\s/.test(original[cursor]||'')&&cursor<original.length)cursor++;
    if(!original.startsWith(line,cursor))throw Error('Части должны точно совпадать с оригиналом и идти подряд, без пропусков.');
    const start=cursor;cursor+=line.length;
    return {start,end:cursor,reads:0};
  });
  if(original.slice(cursor).trim())throw Error('В частях пропущен конец аята.');
  return {parts,joined:0,approvedAt};
}
export function validateParts(plan, original) {
  if(!plan||!Array.isArray(plan.parts)||plan.parts.length<2||plan.parts.length>30||
      !Number.isSafeInteger(plan.joined)||plan.joined<0||plan.joined>1000000||
      typeof plan.approvedAt!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(plan.approvedAt))return false;
  let cursor=0;
  for(const p of plan.parts){
    if(!p||![p.start,p.end,p.reads].every(Number.isSafeInteger)||p.start<cursor||p.end<=p.start||p.end>original.length||p.reads<0||p.reads>1000000||original.slice(cursor,p.start).trim())return false;
    cursor=p.end;
  }
  return !original.slice(cursor).trim();
}

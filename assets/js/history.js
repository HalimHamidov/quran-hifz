export function orderedSurahs(surahs, order, personal) {
  if (order === 'canonical') return [...surahs];
  if (order === 'personal') {
    const ids = [...personal, ...[...surahs].sort((a, b) => a.order - b.order).map(s => s.id).filter(id => !personal.includes(id))];
    return ids.map(id => surahs[id - 1]);
  }
  return [...surahs].sort((a, b) => a.order - b.order);
}

module.exports.arrayMove = (arr, previousIndex, newIndex) => {
  // make copy of original array
  const array = arr.slice(0);

  // if the newIndex is greater than array length - fill in the gap between what is in the array
  // and the newIndex of the element in question with undefined
  if (newIndex >= array.length) {
    let k = newIndex - array.length;
    while (k-- + 1) {
      array.push(undefined);
    }
  }
  // take the array and add an element at the new index with splice. The element to be added is itself
  // defined by splicing from the previousIndex (giving us the moved element in a new array at position 0)
  array.splice(newIndex, 0, array.splice(previousIndex, 1)[0]);
  return array;
}

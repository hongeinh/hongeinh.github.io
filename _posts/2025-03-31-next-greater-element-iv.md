---
layout: default
title: "[Leetcode] Next Greater Element"
date: 2025-03-30
---
### Overview
* [Problem description](#https://leetcode.com/problems/next-greater-element-iv/)
* Topic: Monotonic stack


### Problem Explanation
We’re given a 0-indexed array of non-negative integers `nums`. For each element `nums[i]`, we need to find its **second greater element**, defined as follows:
- The second greater element of `nums[i]` is `nums[j]` where:
  - `j > i` (the element must be to the right of `i`).
  - `nums[j] > nums[i]` (the element must be greater than `nums[i]`).
  - There exists exactly one index `k` such that `i < k < j` and `nums[k] > nums[i]` (there must be exactly one element between `i` and `j` that is also greater than `nums[i]`).
- If no such `nums[j]` exists, the second greater element is `-1`.

**Example**:
- Input: `nums = [1, 2, 4, 3]`
- Output: `[4, 3, -1, -1]`
  - For `nums[0] = 1`: The first greater element to the right is `2` (at index 1), and the second greater element is `4` (at index 2). So, `answer[0] = 4`.
  - For `nums[1] = 2`: The first greater element is `4` (at index 2), and the second greater element is `3` (at index 3). So, `answer[1] = 3`.
  - For `nums[2] = 4`: There’s no element greater than `4` to the right, so the second greater element is `-1`. `answer[2] = -1`.
  - For `nums[3] = 3`: There are no elements to the right, so the second greater element is `-1`. `answer[3] = -1`.

**Goal**: Return an array `answer` where `answer[i]` is the second greater element of `nums[i]`.

---

### Solution Code
Here’s the provided solution:

```python
class Solution:
    def secondGreaterElement(self, nums: List[int]) -> List[int]:
        n = len(nums)

        result = [-1] * n  # Initialize result array with -1
        next_greater = []   # Stack to track indices waiting for their first greater element
        second_greater = [] # Stack to track indices waiting for their second greater element
        for i in range(n):
            print(f"nums[{i}]={nums[i]}", end=" ")
            # Process elements waiting for their second greater element
            while second_greater and nums[second_greater[-1]] <= nums[i]:
                top_i = second_greater.pop()
                result[top_i] = nums[i]
            # Process elements waiting for their first greater element
            tmp = []
            while next_greater and nums[next_greater[-1]] <= nums[i]:
                top_i = next_greater.pop()
                tmp.append(top_i)
            second_greater += tmp[::-1]  # Add to second_greater in reverse order
            next_greater.append(i)       # Add current index to next_greater
            print(next_greater, second_greater)
        return result
```

---


#### Step-by-Step Logic
1. **Initialization**:
   - `result = [-1] * n`: Initialize the result array with `-1` for all indices, as this is the default value if no second greater element is found.
   - `next_greater = []`: A stack to store indices of elements waiting for their first greater element.
   - `second_greater = []`: A stack to store indices of elements waiting for their second greater element.

2. **Iterate Through the Array**:
   - For each index `i` (from 0 to `n-1`), process `nums[i]`:
     - **Step 2.1: Resolve Second Greater Elements**:
       - Check the `second_greater` stack. This stack contains indices of elements that have already found their first greater element and are waiting for their second greater element.
       - While `second_greater` is not empty and `nums[second_greater[-1]] <= nums[i]`:
         - Pop the top index `top_i` from `second_greater`.
         - Set `result[top_i] = nums[i]`, because `nums[i]` is the second greater element for `nums[top_i]`.
       - Why `<=`? If `nums[second_greater[-1]] == nums[i]`, we pop it because we need a strictly greater element, and the current `nums[i]` can’t be the second greater element for `nums[second_greater[-1]]`. The next element might be larger.

     - **Step 2.2: Resolve First Greater Elements**:
       - Check the `next_greater` stack. This stack contains indices of elements waiting for their first greater element.
       - While `next_greater` is not empty and `nums[next_greater[-1]] <= nums[i]`:
         - Pop the top index `top_i` from `next_greater`.
         - Add `top_i` to a temporary list `tmp`.
       - Why `tmp`? We need to move these indices to `second_greater`, but we must maintain the order of elements in `second_greater` (increasing order of their values).

     - **Step 2.3: Move Elements to `second_greater`**:
       - Add the indices in `tmp` to `second_greater` in reverse order (`tmp[::-1]`). This ensures that `second_greater` remains sorted in increasing order of `nums` values (since `next_greater` was also in increasing order).

     - **Step 2.4: Add Current Element to `next_greater`**:
       - Append the current index `i` to `next_greater`. This element now waits for its first greater element.

3. **Return the Result**:
   - After the loop, any indices remaining in `next_greater` or `second_greater` will have their `result` values as `-1` (since no second greater element was found).
   - Return the `result` array.

#### Why Two Stacks?
- The `next_greater` stack helps us find the first greater element for each `nums[i]`.
- Once an element has its first greater element, it moves to `second_greater` to wait for the second greater element.
- Using two stacks allows us to track the two stages separately, ensuring we correctly identify the second greater element.

#### Why Maintain Increasing Order?
- Both stacks are maintained in increasing order of `nums` values (i.e., if `i` is on top of `j` in the stack, then `nums[i] < nums[j]`).
- This ensures that when a new element `nums[i]` is processed, it can resolve elements in the stack efficiently:
  - In `next_greater`, if `nums[i]` is greater than the top element, it’s the first greater element for that top element.
  - In `second_greater`, if `nums[i]` is greater than the top element, it’s the second greater element for that top element.

---

### Example Walkthrough
Let’s walk through the example `nums = [1, 2, 4, 3]` to see how the code works.

- **Initialization**:
  - `n = 4`
  - `result = [-1, -1, -1, -1]`
  - `next_greater = []`
  - `second_greater = []`

- **i = 0, nums[0] = 1**:
  - `second_greater` is empty, so nothing to pop.
  - `next_greater` is empty, so nothing to pop.
  - `tmp = []` (empty).
  - `second_greater += tmp[::-1]` (still empty).
  - `next_greater.append(0)`: `next_greater = [0]`.
  - Print: `nums[0]=1 [0] []`

- **i = 1, nums[1] = 2**:
  - `second_greater` is empty.
  - `next_greater = [0]`:
    - `nums[next_greater[-1]] = nums[0] = 1 <= nums[1] = 2`, so pop `0`.
    - `tmp = [0]`.
  - `second_greater += tmp[::-1] = [0]`: `second_greater = [0]`.
  - `next_greater.append(1)`: `next_greater = [1]`.
  - Print: `nums[1]=2 [1] [0]`
  - (Index 0 has found its first greater element, `2`, and now waits for its second greater element.)

- **i = 2, nums[2] = 4**:
  - `second_greater = [0]`:
    - `nums[second_greater[-1]] = nums[0] = 1 <= nums[2] = 4`, so pop `0`.
    - `result[0] = nums[2] = 4` (second greater element for `nums[0] = 1` is `4`).
  - `second_greater` is now empty.
  - `next_greater = [1]`:
    - `nums[next_greater[-1]] = nums[1] = 2 <= nums[2] = 4`, so pop `1`.
    - `tmp = [1]`.
  - `second_greater += tmp[::-1] = [1]`: `second_greater = [1]`.
  - `next_greater.append(2)`: `next_greater = [2]`.
  - Print: `nums[2]=4 [2] [1]`
  - `result = [4, -1, -1, -1]`

- **i = 3, nums[3] = 3**:
  - `second_greater = [1]`:
    - `nums[second_greater[-1]] = nums[1] = 2 <= nums[3] = 3`, so pop `1`.
    - `result[1] = nums[3] = 3` (second greater element for `nums[1] = 2` is `3`).
  - `second_greater` is now empty.
  - `next_greater = [2]`:
    - `nums[next_greater[-1]] = nums[2] = 4 <= nums[3] = 3` is false, so nothing to pop.
    - `tmp = []`.
  - `second_greater += tmp[::-1]` (still empty).
  - `next_greater.append(3)`: `next_greater = [2, 3]`.
  - Print: `nums[3]=3 [2, 3] []`
  - `result = [4, 3, -1, -1]`

- **End of Loop**:
  - `next_greater = [2, 3]` and `second_greater = []` have no more elements to process, so their corresponding `result` values remain `-1`.
  - Return `result = [4, 3, -1, -1]`.

---

### Time and Space Complexity
- **Time Complexity**: \(O(n)\), where \(n\) is the length of `nums`.
  - Each element is pushed and popped at most once from `next_greater` and `second_greater`.
  - The total number of push/pop operations across both stacks is \(O(n)\).
- **Space Complexity**: \(O(n)\).
  - The `result` array is \(O(n)\).
  - The `next_greater` and `second_greater` stacks can each hold up to \(n\) elements in the worst case (e.g., if the array is in decreasing order).
  - The `tmp` list is temporary and reused, so it doesn’t add to the overall space complexity.

---

### Why This Approach Works
- **Monotonic Stacks**: The use of two monotonic stacks ensures that we efficiently find the first and second greater elements in a single pass through the array.
- **Correctness**:
  - When an element `nums[i]` resolves an index in `next_greater`, it becomes the first greater element for that index.
  - That index then moves to `second_greater`, waiting for the next element that is greater than its first greater element.
  - When an element `nums[i]` resolves an index in `second_greater`, it becomes the second greater element for that index.
- **Edge Cases**:
  - If there’s no second greater element (e.g., for `nums[2] = 4` and `nums[3] = 3`), the `result` value remains `-1`, which is correct.
  - The solution handles duplicates correctly by using `<=` in comparisons, ensuring we always look for strictly greater elements.

---
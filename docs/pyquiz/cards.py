# Card source for the PyLearn Quiz (/pyQuiz/).
# Card ids are <topic><position within topic>. Saved progress uses them, so only ever
# APPEND new cards at the end of a topic; never insert or reorder.
# Each card is a 9-tuple: (topic, q, code, a, w, why, hook, check, mono)
#   q     : None for "out"/"err" cards (default prompts are used); required for concept cards
#   code  : Python code to show (and run), or None for concept cards
#   a, w  : the right answer and the 3 wrong options
#   check : "out" = answer must equal real stdout, "err" = answer must equal the real
#           exception class name, None = concept question with no code to run
#   mono  : True when the options are code/output (always True for out/err cards)
# Running this file verifies every answer with real Python and writes the JSON deck.
# Written for Python 3.9 and 3.13 alike: only exception class names are checked.
import contextlib, io, json, re, sys

TOPICS = [
    ("basics", "Print & variables"),
    ("strings", "Strings"),
    ("numbers", "Numbers & maths"),
    ("lists", "Lists"),
    ("dicts", "Dictionaries"),
    ("tuples", "Tuples & sets"),
    ("logic", "If & True/False"),
    ("loops", "Loops"),
    ("iter", "Looping tools"),
    ("funcs", "Functions"),
    ("errors", "Errors"),
    ("files", "Files & with"),
]

C = [
# ---------- Print & variables ----------
("basics", None, 'print("Hi" * 3)', "HiHiHi", ["Hi 3", "Hi Hi Hi", "TypeError"],
 "Multiplying a string repeats it. Python adds no spaces between the copies.", "Text times a number = copies.", "out", True),
("basics", None, 'x = 5\nx = x + 2\nprint(x)', "7", ["5", "52", "x"],
 "The right side is worked out first (5 + 2), then the result is stored back in x.", "", "out", True),
("basics", None, 'print("2" + "3")', "23", ["5", "2 + 3", "TypeError"],
 "The quotes make these text, not numbers. + glues text together.", "Quotes mean text.", "out", True),
("basics", None, 'a = 1\nb = a\na = 9\nprint(b)', "1", ["9", "10", "a"],
 "b got the value 1 when it was created. Changing a afterwards doesn't touch b.", "", "out", True),
("basics", None, 'print("Hello", "Peter")', "Hello Peter", ["HelloPeter", "Hello,Peter", "Hello"],
 "print puts a space between each thing you give it, separated by commas.", "Commas in print become spaces.", "out", True),
("basics", None, 'name = "Ada"\nprint(f"Hi {name}!")', "Hi Ada!", ["Hi {name}!", "Hi name!", "fHi Ada!"],
 "The f before the quotes makes an f-string: anything in {curly brackets} is replaced by its value.", "f = fill in the blanks.", "out", True),
("basics", "Which of these is NOT allowed as a variable name?", None, "2nd_place", ["second_place", "_place", "place2"],
 "Variable names can't start with a digit. Letters, digits and _ are fine after the first character.", "Names start with a letter or _.", None, True),
("basics", None, 'print("a", "b", sep="-")', "a-b", ["a b", "a - b", "ab"],
 "sep decides what print puts between the things. The normal gap is a space; here you swapped it for a dash.", "sep = what goes in between.", "out", True),
("basics", None, 'print(type(3.0))', "<class 'float'>", ["<class 'int'>", "float", "3.0"],
 "A number written with a decimal point is a float, even when it is a whole amount like 3.0. Written without one, like 3, it is an int.", "Decimal point = float.", "out", True),

# ---------- Strings ----------
("strings", None, 'word = "python"\nprint(word[0])', "p", ["y", "python", "n"],
 "Python counts positions from 0, so [0] is the first letter.", "Counting starts at zero.", "out", True),
("strings", None, 'word = "python"\nprint(word[-1])', "n", ["p", "o", "IndexError"],
 "Negative positions count from the end. [-1] is the last letter.", "-1 = last one.", "out", True),
("strings", None, 'print(len("hello world"))', "11", ["10", "2", "5"],
 "len counts every character, and the space counts too: 5 + 1 + 5.", "Spaces are characters.", "out", True),
("strings", None, 'print("Bob".upper())', "BOB", ["bob", "Bob", "B"],
 ".upper() gives back a copy of the text in capitals.", "", "out", True),
("strings", None, 'word = "python"\nprint(word[1:4])', "yth", ["pyth", "ytho", "yt"],
 "A slice [1:4] starts at position 1 and stops just before position 4: y, t, h.", "Slices stop before the end number.", "out", True),
("strings", None, 's = "a,b,c"\nprint(s.split(","))', "['a', 'b', 'c']", ["abc", "['a,b,c']", "a b c"],
 ".split(\",\") cuts the text at every comma and gives back a list of the pieces.", "", "out", True),
("strings", None, 'print("cat" in "concatenate")', "True", ["False", "cat", "3"],
 "in checks whether one piece of text appears inside another: con-CAT-enate.", "", "out", True),
("strings", None, 'print("  hi  ".strip() + "!")', "hi!", ["  hi  !", "hi !", " hi !"],
 ".strip() removes the spaces from both ends of the text, so only hi is left before the !.", "strip = trim the edges.", "out", True),
("strings", None, 'print("a-b-c".replace("-", "+"))', "a+b+c", ["a+b-c", "a-b-c", "a b c"],
 ".replace(old, new) swaps every match for the new piece and gives back a new text.", "", "out", True),
("strings", None, 's = "cat"\ns[0] = "b"', "TypeError", ["bat", "IndexError", "NameError"],
 "Text can't be changed in place. To get \"bat\" you build a new text, for example \"b\" + s[1:].", "Strings can't be edited, only replaced.", "err", True),

# ---------- Numbers & maths ----------
("numbers", None, 'print(7 / 2)', "3.5", ["3", "4", "3.0"],
 "A single / always gives a decimal answer in Python 3.", "", "out", True),
("numbers", None, 'print(7 // 2)', "3", ["3.5", "4", "1"],
 "// divides and rounds down to the next whole number below: 3.5 becomes 3. (With negative numbers it still rounds down, so -3.5 becomes -4.)", "Double slash = round down.", "out", True),
("numbers", None, 'print(7 % 2)', "1", ["3", "3.5", "0"],
 "% gives the remainder: 7 = 2 x 3, with 1 left over.", "% = what's left over.", "out", True),
("numbers", None, 'print(2 ** 3)', "8", ["6", "5", "9"],
 "** means \"to the power of\": 2 x 2 x 2.", "", "out", True),
("numbers", None, 'print(2 + 3 * 4)', "14", ["20", "24", "9"],
 "Multiplication happens before addition, like on a calculator: 3 x 4 = 12, then + 2.", "", "out", True),
("numbers", None, 'print(int("4") + 1)', "5", ["41", "TypeError", "4"],
 "int() turns the text \"4\" into the number 4, so + now adds.", "", "out", True),
("numbers", None, 'print(round(2.567, 1))', "2.6", ["2.5", "3", "2.57"],
 "round(number, 1) keeps one digit after the decimal point.", "", "out", True),
("numbers", None, 'print(int(3.9))', "3", ["4", "3.9", "3.0"],
 "int() chops off the decimal part. It does not round up.", "int chops, round rounds.", "out", True),
("numbers", None, 'print(-7 // 2)', "-4", ["-3", "-3.5", "4"],
 "// always rounds down to the lower number. The lower whole number next to -3.5 is -4, not -3.", "// always goes down.", "out", True),

# ---------- Lists ----------
("lists", None, 'nums = [10, 20, 30]\nprint(nums[1])', "20", ["10", "30", "[10, 20]"],
 "Lists count from 0 too: [0] is 10, [1] is 20.", "", "out", True),
("lists", None, 'nums = [1, 2]\nnums.append(3)\nprint(nums)', "[1, 2, 3]", ["[3, 1, 2]", "[1, 2]", "3"],
 ".append() adds one item to the end of the list.", "", "out", True),
("lists", None, 'print(len([1, [2, 3], 4]))', "3", ["4", "2", "1"],
 "The inner list [2, 3] counts as one item. The outer list holds 3 things.", "", "out", True),
("lists", None, 'nums = [3, 1, 2]\nnums.sort()\nprint(nums)', "[1, 2, 3]", ["[3, 2, 1]", "[3, 1, 2]", "None"],
 ".sort() puts the list in order, smallest first, and changes the list itself.", "", "out", True),
("lists", None, 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)', "[1, 2, 3]", ["[1, 2]", "[1, 2, 3, 3]", "[3]"],
 "b = a doesn't copy the list. a and b are two labels on the same list, so a change through b shows up in a.", "Two labels, one box.", "out", True),
("lists", None, 'nums = [5, 6, 7, 8]\nprint(nums[1:3])', "[6, 7]", ["[6, 7, 8]", "[5, 6, 7]", "[7, 8]"],
 "Slices work on lists like on text: start at 1, stop before 3.", "", "out", True),
("lists", None, 'nums = [1, 2, 3]\nprint(nums.pop())', "3", ["1", "[1, 2]", "None"],
 ".pop() takes the last item off the list and hands it back to you.", "", "out", True),
("lists", None, 'nums = [1, 3]\nnums.insert(1, 2)\nprint(nums)', "[1, 2, 3]", ["[1, 3, 2]", "[2, 1, 3]", "[1, 3]"],
 ".insert(1, 2) puts 2 at position 1 and pushes the rest along.", "insert(where, what).", "out", True),
("lists", None, 'nums = [3, 1, 2]\nprint(nums.sort())', "None", ["[1, 2, 3]", "[3, 1, 2]", "TypeError"],
 ".sort() changes the list but gives back nothing (None). If you want the sorted list as a result, use sorted(nums).", "sort() changes it, sorted() gives a new one.", "out", True),
("lists", None, 'print([0] * 3)', "[0, 0, 0]", ["[0]", "[3]", "[0, 3]"],
 "Multiplying a list repeats its items, just like multiplying text.", "", "out", True),

# ---------- Dictionaries ----------
("dicts", None, 'ages = {"Ann": 30, "Bo": 25}\nprint(ages["Bo"])', "25", ["Bo", "30", "KeyError"],
 "A dictionary looks things up by key. The key \"Bo\" gives its value, 25.", "", "out", True),
("dicts", None, 'ages = {"Ann": 30}\nages["Cy"] = 40\nprint(len(ages))', "2", ["1", "3", "40"],
 "Assigning to a new key adds it. Now there are two pairs.", "", "out", True),
("dicts", None, 'ages = {"Ann": 30}\nprint(ages.get("Zed", 0))', "0", ["None", "KeyError", "Zed"],
 ".get(key, default) gives the default when the key isn't there, instead of crashing.", "", "out", True),
("dicts", "What does a dictionary store?", None, "Pairs of keys and values", ["Only numbers, in order", "Words in alphabetical order", "Definitions of Python commands"],
 "A dictionary links each key (like a name) to a value (like an age), so you can look values up by key.", "Like a phone book: name → number.", None, False),
("dicts", None, 'ages = {"Ann": 30}\nprint(30 in ages)', "False", ["True", "30", "KeyError"],
 "in on a dictionary checks the keys, not the values. 30 is a value; the only key is \"Ann\".", "in looks at keys.", "out", True),
("dicts", None, 'd = {"x": 1}\nd["x"] = 5\nprint(d)', "{'x': 5}", ["{'x': 1}", "{'x': 1, 'x': 5}", "{'x': 6}"],
 "A key can only appear once. Assigning to an existing key replaces its value.", "", "out", True),
("dicts", None, 'd = {"a": 1, "b": 2}\ndel d["a"]\nprint(d)', "{'b': 2}", ["{'a': 1}", "{'a': 1, 'b': 2}", "{}"],
 "del removes that key and its value from the dictionary. Only \"b\" is left.", "", "out", True),
("dicts", None, 'print({"a": 1}.get("z"))', "None", ["0", "KeyError", "z"],
 ".get with no default gives back None when the key is missing. That is the \"nothing\" value.", "", "out", True),
("dicts", None, 'ages = {"Ann": 30}\nprint(ages["Bo"])', "KeyError", ["None", "0", "IndexError"],
 "Square brackets crash when the key isn't there. Use .get() if the key might be missing.", "[ ] crashes, .get() doesn't.", "err", True),

# ---------- Tuples & sets ----------
("tuples", None, 'a, b = 1, 2\nprint(b)', "2", ["1", "(1, 2)", "3"],
 "Python hands the values out in order: a gets 1, b gets 2.", "", "out", True),
("tuples", None, 'a = 1\nb = 2\na, b = b, a\nprint(a, b)', "2 1", ["1 2", "2 2", "1 1"],
 "The right side is worked out first, as the pair (2, 1), then handed to a and b. That swaps them with no third variable.", "Swap in one line.", "out", True),
("tuples", None, 't = (4, 5, 6)\nprint(t[1])', "5", ["4", "6", "(4, 5)"],
 "Tuples count from 0 like lists, so [1] is the second item.", "", "out", True),
("tuples", None, 't = (1, 2, 3)\nt[0] = 9', "TypeError", ["IndexError", "NameError", "(9, 2, 3)"],
 "A tuple can't be changed after it's made. A list can.", "Tuples are locked.", "err", True),
("tuples", "What can you do with a list that you can't do with a tuple?", None, "Change its items after it is made",
 ["Look up items by position", "Count its items with len", "Loop over it with for"],
 "A tuple is fixed once it's made. A list can grow, shrink and have items replaced. Reading, len and loops work on both.", "List = editable, tuple = locked.", None, False),
("tuples", None, 'print(len(set([1, 1, 2])))', "2", ["3", "1", "[1, 2]"],
 "A set keeps each value only once, so 1, 1, 2 becomes just 1 and 2.", "Sets drop duplicates.", "out", True),
("tuples", None, 'print(2 in {1, 2})', "True", ["False", "2", "{1, 2}"],
 "in asks whether the value is inside the set. 2 is there.", "", "out", True),
("tuples", None, 'print(sorted(set([3, 1, 3, 2])))', "[1, 2, 3]", ["[3, 1, 3, 2]", "[3, 1, 2]", "[1, 2, 3, 3]"],
 "set() drops the repeats, then sorted() gives back a list in order. Sets have no fixed order, so we sort before printing.", "", "out", True),
("tuples", None, 's = set()\ns.add("a")\nprint(s)', "{'a'}", ["['a']", "set()", "('a')"],
 "set() starts an empty set and .add() puts one item in. Sets print with curly brackets. (A dictionary uses curly brackets too, but with key: value pairs, and an empty {} is a dictionary.)", "Curly brackets, no colons = set.", "out", True),

# ---------- If & True/False ----------
("logic", None, 'print(5 == 5.0)', "True", ["False", "5", "TypeError"],
 "== compares values. 5 and 5.0 are the same amount.", "", "out", True),
("logic", None, 'x = 7\nif x > 5:\n    print("big")\nelse:\n    print("small")', "big", ["small", "big\nsmall", "7"],
 "7 > 5 is True, so only the indented line under if runs.", "", "out", True),
("logic", None, 'x = 3\nif x > 5:\n    print("A")\nelif x > 2:\n    print("B")\nelse:\n    print("C")', "B", ["A", "C", "B\nC"],
 "Python checks each condition in order and runs only the first one that's True.", "Only one branch ever runs.", "out", True),
("logic", None, 'print(True and False)', "False", ["True", "None", "True False"],
 "With True and False, and only gives True when both sides are True. Python stops at the first side that is False.", "", "out", True),
("logic", None, 'print(bool(""))', "False", ["True", "None", '""'],
 "Empty things (\"\", 0, [], {}) count as False. Anything with content counts as True.", "Empty = False.", "out", True),
("logic", "What's the difference between = and ==?", None, "= stores a value, == checks if two things are equal", ["They do the same thing", "== stores a value, = checks", "= is for numbers, == is for text"],
 "x = 5 puts 5 in x. x == 5 asks a question and answers True or False.", "One = sets, two == ask.", None, False),
("logic", None, 'print(0 or 5)', "5", ["0", "True", "False"],
 "or gives back the first side that counts as True, or the last side if none do. 0 counts as False, so you get 5.", "", "out", True),
("logic", None, 'print(1 < 2 < 3)', "True", ["False", "2", "TypeError"],
 "Python reads this as 1 < 2 and 2 < 3, like in maths class.", "", "out", True),
("logic", None, 'x = 6\nif x > 5:\n    if x > 10:\n        print("huge")\n    else:\n        print("medium")', "medium", ["huge", "nothing", "medium\nhuge"],
 "x > 5 is True, so we go inside. Then x > 10 is False, so the else line runs.", "", "out", True),
("logic", "How do you check whether x holds None (no value)?", None, "x is None", ["x = None", "x == 0", "x is empty"],
 "None means \"no value\". x is None asks the question; x = None would store it instead.", "is None = is it nothing?", None, True),

# ---------- Loops ----------
("loops", None, 'for i in range(3):\n    print(i)', "0\n1\n2", ["1\n2\n3", "0\n1\n2\n3", "3"],
 "range(3) gives 0, 1, 2: three numbers, starting at 0 and stopping before 3.", "range stops before the number.", "out", True),
("loops", None, 'total = 0\nfor n in [1, 2, 3]:\n    total += n\nprint(total)', "6", ["3", "0", "123"],
 "total += n adds each number in turn: 0 + 1 + 2 + 3. The print is outside the loop, so it runs once.", "", "out", True),
("loops", None, 'n = 3\nwhile n > 0:\n    n -= 1\nprint(n)', "0", ["1", "3", "-1"],
 "The loop keeps going while n > 0. It stops as soon as n reaches 0.", "", "out", True),
("loops", None, 'print(list(range(2, 8, 2)))', "[2, 4, 6]", ["[2, 4, 6, 8]", "[2, 8]", "[4, 6, 8]"],
 "range(start, stop, step): start at 2, go up by 2, stop before 8.", "", "out", True),
("loops", None, 'for ch in "hi":\n    print(ch * 2)', "hh\nii", ["hihi", "h\ni", "hhii"],
 "Looping over text gives one letter at a time. Each print goes on its own line.", "", "out", True),
("loops", None, 'for n in range(5):\n    if n == 3:\n        break\n    print(n)', "0\n1\n2", ["0\n1\n2\n3", "0\n1\n2\n3\n4", "3"],
 "break leaves the loop immediately, before 3 is printed.", "break = leave now.", "out", True),
("loops", None, 'for n in range(4):\n    if n == 2:\n        continue\n    print(n)', "0\n1\n3", ["0\n1", "0\n1\n2\n3", "2"],
 "continue skips the rest of this pass and jumps to the next one. Only the 2 is skipped; the loop carries on.", "continue = skip this one.", "out", True),
("loops", None, 'count = 0\nfor i in range(3):\n    for j in range(2):\n        count += 1\nprint(count)', "6", ["5", "3", "2"],
 "The inner loop runs 2 times for every pass of the outer loop. 3 passes x 2 = 6.", "Loop in a loop = multiply.", "out", True),
("loops", None, 'print(list(range(3, 0, -1)))', "[3, 2, 1]", ["[3, 2, 1, 0]", "[2, 1, 0]", "[0, 1, 2, 3]"],
 "A step of -1 counts down. It still stops before the end number, so 0 isn't included.", "", "out", True),
("loops", None, 's = ""\nfor ch in "abc":\n    s = ch + s\nprint(s)', "cba", ["abc", "a", "aabbcc"],
 "Each new letter is stuck on the front of s: a, then ba, then cba.", "", "out", True),

# ---------- Looping tools ----------
("iter", None, 'd = {"a": 1, "b": 2}\nfor k, v in d.items():\n    print(k, v)', "a 1\nb 2", ["a\nb", "1\n2", "(a, 1)\n(b, 2)"],
 ".items() hands you each key and value together, so the loop can use both names.", "items = key and value.", "out", True),
("iter", None, 'for i, c in enumerate(["x", "y"], start=1):\n    print(i, c)', "1 x\n2 y", ["0 x\n1 y", "x 1\ny 2", "1\n2"],
 "enumerate numbers the items for you. start=1 makes it count from 1 instead of 0.", "", "out", True),
("iter", None, 'print(list(zip([1, 2], ["a", "b"])))', "[(1, 'a'), (2, 'b')]", ["[1, 2, 'a', 'b']", "[[1, 2], ['a', 'b']]", "[(1, 2), ('a', 'b')]"],
 "zip pairs up the lists item by item: first with first, second with second.", "zip = like a zipper.", "out", True),
("iter", None, 'print([x * 2 for x in [1, 2, 3]])', "[2, 4, 6]", ["[1, 2, 3, 1, 2, 3]", "[2, 4]", "[1, 4, 9]"],
 "A list comprehension is a loop in one line: take each x, double it, collect the results in a new list.", "", "out", True),
("iter", None, 'print([n for n in range(6) if n % 2 == 0])', "[0, 2, 4]", ["[2, 4]", "[1, 3, 5]", "[0, 2, 4, 6]"],
 "The if at the end filters: only numbers with no remainder when divided by 2 are kept. 0 counts as even.", "", "out", True),
("iter", None, 'print(len(range(2, 10, 2)))', "4", ["5", "8", "10"],
 "range(2, 10, 2) is 2, 4, 6, 8. That is 4 numbers.", "", "out", True),
("iter", "What does enumerate(items) give you on each pass of a loop?", None, "A position number and the item",
 ["Only the item", "Only the position number", "The items in reverse order"],
 "Each pass gives a pair: the position (0, 1, 2...) and the item at that position. You usually write for i, item in enumerate(items).", "enumerate = counter + item.", None, False),
("iter", None, 'for k in {"a": 1, "b": 2}:\n    print(k)', "a\nb", ["1\n2", "a 1\nb 2", "a\n1\nb\n2"],
 "Looping straight over a dictionary gives you the keys. Use .items() if you want the values too.", "Loop on a dict = keys.", "out", True),
("iter", None, 'print(sum([n * n for n in [1, 2, 3]]))', "14", ["6", "36", "9"],
 "The comprehension squares each number to make [1, 4, 9], and sum adds them up: 14.", "", "out", True),

# ---------- Functions ----------
("funcs", None, 'def double(x):\n    return x * 2\n\nprint(double(4))', "8", ["4", "44", "None"],
 "double(4) runs the function with x = 4 and gives back 4 * 2.", "", "out", True),
("funcs", None, 'def greet():\n    print("hi")\n\nresult = greet()\nprint(result)', "hi\nNone", ["hi", "None", "hi\nhi"],
 "greet() prints hi, but it has no return, so it gives back None, which the second print shows.", "No return = None.", "out", True),
("funcs", None, 'def add(a, b=10):\n    return a + b\n\nprint(add(5))', "15", ["5", "TypeError", "510"],
 "b=10 is a default. If you don't pass b, it uses 10.", "", "out", True),
("funcs", "What does return do inside a function?", None, "Sends a value back and ends the function", ["Prints the value on screen", "Starts the function again", "Saves the value to a file"],
 "return hands a value back to whoever called the function and leaves it. The normal lines after it don't run.", "return = hand back.", None, False),
("funcs", None, 'def lo_hi(a, b):\n    return min(a, b), max(a, b)\n\nprint(lo_hi(9, 4))', "(4, 9)", ["(9, 4)", "4", "[4, 9]"],
 "A function can return several values at once. They come back together as a tuple, smaller one first here.", "", "out", True),
("funcs", None, 'def gap(w, h):\n    return w - h\n\nprint(gap(h=1, w=5))', "4", ["-4", "6", "TypeError"],
 "With names (keyword arguments) the order doesn't matter. w is 5 and h is 1, so 5 - 1.", "Names beat order.", "out", True),
("funcs", None, 'def f():\n    total = 5\n\nf()\nprint(total)', "NameError", ["5", "None", "0"],
 "A variable made inside a function only lives inside it. Outside, Python has never heard of total.", "Inside variables stay inside.", "err", True),
("funcs", None, 'def add(a, b):\n    return a + b\n\ndef triple(a, b):\n    return add(a, b) * 3\n\nprint(triple(1, 2))', "9", ["3", "6", "123"],
 "triple calls add, which gives 3, then multiplies that by 3.", "", "out", True),
("funcs", None, 'def f():\n    return 1\n    print("never")\n\nprint(f())', "1", ["never\n1", "never", "None"],
 "return leaves the function right there, so the normal line after it never runs.", "", "out", True),
("funcs", 'You write def greet(name): and later call greet("Ann"). Which one is the argument?', None, '"Ann"', ["name", "greet", "def"],
 "The argument is the actual value you pass in when you call. The parameter (name) is the label inside the function that receives it.", "Parameter = slot, argument = what goes in.", None, True),

# ---------- Errors ----------
("errors", None, 'print("Age: " + 30)', "TypeError", ["Age: 30", "Age 30", "SyntaxError"],
 "You can't + text and a number. Fix it with str(30) or an f-string: f\"Age: {30}\".", "Text + number = TypeError.", "err", True),
("errors", None, 'nums = [1, 2, 3]\nprint(nums[3])', "IndexError", ["3", "None", "KeyError"],
 "The positions are 0, 1, 2. There is no position 3.", "", "err", True),
("errors", None, 'print(score)', "NameError", ["0", "None", "score"],
 "score was never given a value, so Python doesn't know the name.", "", "err", True),
("errors", None, 'print(10 / 0)', "ZeroDivisionError", ["0", "inf", "10"],
 "Dividing by zero isn't allowed in Python, so it stops with an error.", "", "err", True),
("errors", None, 'int("five")', "ValueError", ["5", "TypeError", "NameError"],
 "\"five\" is text, which int() accepts, but it isn't written as a whole number, so the value is wrong.", "", "err", True),
("errors", None, 'x = 5\nx.append(1)', "AttributeError", ["TypeError", "NameError", "[5, 1]"],
 "A number has no .append. That command belongs to lists, so Python says the thing has no such attribute.", "", "err", True),
("errors", None, 'print(len(5))', "TypeError", ["1", "0", "ValueError"],
 "len needs something with a length, like text or a list. A plain number has none, so it's the wrong type.", "", "err", True),
("errors", None, 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("oops")', "oops", ["ZeroDivisionError", "inf", "Nothing is printed"],
 "The error happens inside try, so Python jumps to the matching except and runs that instead. The program carries on.", "try = catch the fall.", "out", True),
("errors", None, 'int("3.5")', "ValueError", ["3", "4", "TypeError"],
 "int() can't read a decimal point in text. It's a text value it can't turn into a whole number.", "", "err", True),
("errors", "The last line of an error message starts with KeyError. What does that name tell you?", None, "What kind of problem happened",
 ["Which line to fix first", "How many errors there were", "Which file crashed"],
 "The name at the start of the last line is the type of problem. The lines above it show where it happened.", "Read the last line first.", None, False),

# ---------- Files & with ----------
("files", 'What does opening a file with "w" do if the file already exists?', None, "Erases what was in it and starts empty",
 ["Adds new text at the end", "Gives an error", "Opens it without changing it"],
 "\"w\" means write from scratch, so the old contents are wiped as soon as you open it. Use \"a\" to keep them.", "w = wipe and write.", None, False),
("files", "What does the with statement guarantee when you open a file?", None, "The file is closed when the block ends",
 ["The file is created if missing", "The file is read in one go", "Other apps can't touch the file"],
 "with closes the file for you when the indented block finishes, even if something goes wrong inside.", "with = closes itself.", None, False),
("files", 'What happens if you open "data.txt" in "r" mode and it does not exist?', None, "FileNotFoundError",
 ["An empty file is created", "It gives back an empty string", "Python waits until the file appears"],
 "\"r\" only reads files that are already there. A missing file stops the program with FileNotFoundError.", "", None, False),
("files", "What does file.readlines() give you?", None, "A list with one string per line",
 ["One long string", "The number of lines", "Only the first line"],
 "Every line becomes one item in a list. Each item keeps its line ending, except perhaps the last line if the file doesn't end with one.", "", None, False),
("files", 'Why would you open a file in "a" mode?', None, "To add new text to the end without erasing",
 ["To read the file faster", "To make a copy of the file", "To delete the old text first"],
 "\"a\" stands for append. New text goes after what is already there.", "a = add to the end.", None, False),
("files", 'You call f.write("Ann") and then f.write("Bob"). What is in the file?', None, "AnnBob on one line",
 ["Ann and Bob on two lines", "Ann Bob with a space", "Only Bob"],
 "write() adds exactly the text you give it and no newline. Write \"Ann\\n\" if you want a line break.", "write() adds no newline.", None, False),
("files", None, 'line = "Ann,30\\n"\nprint(line.strip().split(","))', "['Ann', '30']", ["['Ann', '30\\n']", "['Ann,30']", "Ann 30"],
 "Lines read from a file usually end with \\n. .strip() removes spaces and line endings from both ends, then .split(\",\") cuts the line into pieces.", "strip first, then split.", "out", True),
("files", None, 'line = "hello\\n"\nprint(len(line))', "6", ["5", "7", "1"],
 "The \\n at the end is one invisible character, so \"hello\" plus the newline is 6.", "", "out", True),
("files", None, 'text = "one\\ntwo\\nthree"\nprint(text.split("\\n"))', "['one', 'two', 'three']", ["['one\\ntwo\\nthree']", "one two three", "3"],
 "\\n marks the end of a line. Splitting on it gives one item per line, which is much like reading a file line by line.", "", "out", True),
]

FORBIDDEN = ["open(", "import", "input(", "whileTrue", "__"]  # matched with all whitespace removed
MAX_OPT = 70
MIN_PER_TOPIC = 7

def run(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, {"__builtins__": __builtins__})
        return buf.getvalue().rstrip("\n"), None
    except Exception as e:
        return buf.getvalue().rstrip("\n"), type(e).__name__

topic_ids = [t for t, _ in TOPICS]
out, bad, counts, verified = [], 0, {}, 0

def problem(cid, msg):
    global bad
    print(f"PROBLEM {cid}: {msg}")
    bad += 1

for card in C:
    if len(card) != 9:
        problem("?", f"card is not a 9-tuple: {card[:3]!r}"); continue
    t, q, code, a, w, why, hook, check, mono = card
    if t not in topic_ids:
        problem("?", f"topic {t!r} is not in TOPICS"); continue
    counts[t] = counts.get(t, 0) + 1
    cid = f"{t}{counts[t]}"
    if check not in ("out", "err", None):
        problem(cid, f"bad check value {check!r}")
    if check is None:
        if not (isinstance(q, str) and q.strip()):
            problem(cid, "concept card needs a non-empty q")
        if code is not None:
            problem(cid, "concept card must have code None")
    else:
        if q is not None:
            problem(cid, "out/err card must have q None")
        if mono is not True:
            problem(cid, "out/err card must have mono True")
    # options
    if len(w) != 3 or len(set([a] + w)) != 4:
        problem(cid, "need exactly 4 distinct options (1 answer + 3 wrong)")
    if a in w:
        problem(cid, "answer is also among the wrong options")
    for o in [a] + w:
        if len(o) > MAX_OPT:
            problem(cid, f"option longer than {MAX_OPT} chars: {o!r}")
    # code
    if check:
        hits = [bit for bit in FORBIDDEN if bit in re.sub(r"\s+", "", code)]
        for bit in hits:
            problem(cid, f"code contains forbidden {bit!r}")
        if hits:
            continue  # never execute a snippet that failed the safety check
        got, err = run(code)
        if check == "out" and err:
            problem(cid, f"UNEXPECTED ERROR {err}")
        if check == "err":
            if not err:
                problem(cid, "expected an error but code ran fine")
            if got:
                problem(cid, f"stdout before the error is not empty: {got!r}")
        real = err if check == "err" else got
        verified += 1
        if real != a:
            problem(cid, f"WRONG ANSWER {a!r}, real: {real!r}")
        if real in w:
            problem(cid, "a wrong option equals the real result")
    kind = check if check in ("out", "err") else "concept"
    out.append({"id": cid, "t": t, "k": kind,
                "q": q or ("What does this print?" if kind == "out" else "What happens when this runs?"),
                "code": code or "", "a": a, "w": w, "why": why, "h": hook, "mono": mono})

for tid, name in TOPICS:
    if counts.get(tid, 0) < MIN_PER_TOPIC:
        problem(tid, f"topic has {counts.get(tid, 0)} cards, needs at least {MIN_PER_TOPIC}")

json.dump({"topics": [{"id": i, "n": n} for i, n in TOPICS], "cards": out},
          open(sys.argv[1], "w"), ensure_ascii=False)
print("per topic:", ", ".join(f"{t}={counts.get(t, 0)}" for t in topic_ids))
print(f"{len(out)} cards, {verified} verified against real Python, {bad} problems")
sys.exit(1 if bad else 0)

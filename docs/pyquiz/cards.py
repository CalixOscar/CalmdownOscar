# Card source for the PyLearn quiz try-out.
# Each card: (topic, code, answer, wrong options, why, memory hook, check)
# check: "out" = answer must equal real stdout, "err" = answer must equal the real
# exception name, None = concept question with no code to run.
# Running this file verifies every answer with real Python and writes cards.json.
import contextlib, io, json, sys

C = [
# ---------- Print & variables ----------
("basics", 'print("Hi" * 3)', "HiHiHi", ["Hi 3", "Hi Hi Hi", "TypeError"],
 "Multiplying a string repeats it. Python adds no spaces between the copies.", "Text times a number = copies.", "out"),
("basics", 'x = 5\nx = x + 2\nprint(x)', "7", ["5", "52", "x"],
 "The right side is worked out first (5 + 2), then the result is stored back in x.", "", "out"),
("basics", 'print("2" + "3")', "23", ["5", "2 + 3", "TypeError"],
 "The quotes make these text, not numbers. + glues text together.", "Quotes mean text.", "out"),
("basics", 'a = 1\nb = a\na = 9\nprint(b)', "1", ["9", "10", "a"],
 "b got the value 1 when it was created. Changing a afterwards doesn't touch b.", "", "out"),
("basics", 'print("Hello", "Peter")', "Hello Peter", ["HelloPeter", "Hello,Peter", "Hello"],
 "print puts a space between each thing you give it, separated by commas.", "Commas in print become spaces.", "out"),
("basics", 'name = "Ada"\nprint(f"Hi {name}!")', "Hi Ada!", ["Hi {name}!", "Hi name!", "fHi Ada!"],
 "The f before the quotes makes an f-string: anything in {curly brackets} is replaced by its value.", "f = fill in the blanks.", "out"),
("basics", None, "2nd_place", ["second_place", "_place", "place2"],
 "Variable names can't start with a digit. Letters, digits and _ are fine after the first character.", "Names start with a letter or _.", None),

# ---------- Strings ----------
("strings", 'word = "python"\nprint(word[0])', "p", ["y", "python", "n"],
 "Python counts positions from 0, so [0] is the first letter.", "Counting starts at zero.", "out"),
("strings", 'word = "python"\nprint(word[-1])', "n", ["p", "o", "IndexError"],
 "Negative positions count from the end. [-1] is the last letter.", "-1 = last one.", "out"),
("strings", 'print(len("hello world"))', "11", ["10", "2", "5"],
 "len counts every character, and the space counts too: 5 + 1 + 5.", "Spaces are characters.", "out"),
("strings", 'print("Bob".upper())', "BOB", ["bob", "Bob", "B"],
 ".upper() gives back a copy of the text in capitals.", "", "out"),
("strings", 'word = "python"\nprint(word[1:4])', "yth", ["pyth", "ytho", "yt"],
 "A slice [1:4] starts at position 1 and stops just before position 4: y, t, h.", "Slices stop before the end number.", "out"),
("strings", 's = "a,b,c"\nprint(s.split(","))', "['a', 'b', 'c']", ["abc", "['a,b,c']", "a b c"],
 ".split(\",\") cuts the text at every comma and gives back a list of the pieces.", "", "out"),
("strings", 'print("cat" in "concatenate")', "True", ["False", "cat", "3"],
 "in checks whether one piece of text appears inside another: con-CAT-enate.", "", "out"),

# ---------- Numbers & maths ----------
("numbers", 'print(7 / 2)', "3.5", ["3", "4", "3.0"],
 "A single / always gives a decimal answer in Python 3.", "", "out"),
("numbers", 'print(7 // 2)', "3", ["3.5", "4", "1"],
 "// divides and throws away the leftover part, rounding down.", "Double slash = whole number.", "out"),
("numbers", 'print(7 % 2)', "1", ["3", "3.5", "0"],
 "% gives the remainder: 7 = 2 x 3, with 1 left over.", "% = what's left over.", "out"),
("numbers", 'print(2 ** 3)', "8", ["6", "5", "9"],
 "** means \"to the power of\": 2 x 2 x 2.", "", "out"),
("numbers", 'print(2 + 3 * 4)', "14", ["20", "24", "9"],
 "Multiplication happens before addition, like on a calculator: 3 x 4 = 12, then + 2.", "", "out"),
("numbers", 'print(int("4") + 1)', "5", ["41", "TypeError", "4"],
 "int() turns the text \"4\" into the number 4, so + now adds.", "", "out"),
("numbers", 'print(round(2.567, 1))', "2.6", ["2.5", "3", "2.57"],
 "round(number, 1) keeps one digit after the decimal point.", "", "out"),

# ---------- Lists ----------
("lists", 'nums = [10, 20, 30]\nprint(nums[1])', "20", ["10", "30", "[10, 20]"],
 "Lists count from 0 too: [0] is 10, [1] is 20.", "", "out"),
("lists", 'nums = [1, 2]\nnums.append(3)\nprint(nums)', "[1, 2, 3]", ["[3, 1, 2]", "[1, 2]", "3"],
 ".append() adds one item to the end of the list.", "", "out"),
("lists", 'print(len([1, [2, 3], 4]))', "3", ["4", "2", "1"],
 "The inner list [2, 3] counts as one item. The outer list holds 3 things.", "", "out"),
("lists", 'nums = [3, 1, 2]\nnums.sort()\nprint(nums)', "[1, 2, 3]", ["[3, 2, 1]", "[3, 1, 2]", "None"],
 ".sort() puts the list in order, smallest first, and changes the list itself.", "", "out"),
("lists", 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)', "[1, 2, 3]", ["[1, 2]", "[1, 2, 3, 3]", "[3]"],
 "b = a doesn't copy the list. a and b are two labels on the same list, so a change through b shows up in a.", "Two labels, one box.", "out"),
("lists", 'nums = [5, 6, 7, 8]\nprint(nums[1:3])', "[6, 7]", ["[6, 7, 8]", "[5, 6, 7]", "[7, 8]"],
 "Slices work on lists like on text: start at 1, stop before 3.", "", "out"),

# ---------- Dictionaries ----------
("dicts", 'ages = {"Ann": 30, "Bo": 25}\nprint(ages["Bo"])', "25", ["Bo", "30", "KeyError"],
 "A dictionary looks things up by key. The key \"Bo\" gives its value, 25.", "", "out"),
("dicts", 'ages = {"Ann": 30}\nages["Cy"] = 40\nprint(len(ages))', "2", ["1", "3", "40"],
 "Assigning to a new key adds it. Now there are two pairs.", "", "out"),
("dicts", 'ages = {"Ann": 30}\nprint(ages.get("Zed", 0))', "0", ["None", "KeyError", "Zed"],
 ".get(key, default) gives the default when the key isn't there, instead of crashing.", "", "out"),
("dicts", None, "Pairs of keys and values", ["Only numbers, in order", "Words in alphabetical order", "Definitions of Python commands"],
 "A dictionary links each key (like a name) to a value (like an age), so you can look values up by key.", "Like a phone book: name → number.", None),

# ---------- If & True/False ----------
("logic", 'print(5 == 5.0)', "True", ["False", "5", "TypeError"],
 "== compares values. 5 and 5.0 are the same amount.", "", "out"),
("logic", 'x = 7\nif x > 5:\n    print("big")\nelse:\n    print("small")', "big", ["small", "big\nsmall", "7"],
 "7 > 5 is True, so only the indented line under if runs.", "", "out"),
("logic", 'x = 3\nif x > 5:\n    print("A")\nelif x > 2:\n    print("B")\nelse:\n    print("C")', "B", ["A", "C", "B\nC"],
 "Python checks each condition in order and runs only the first one that's True.", "Only one branch ever runs.", "out"),
("logic", 'print(True and False)', "False", ["True", "None", "True False"],
 "and is only True when both sides are True.", "", "out"),
("logic", 'print(bool(""))', "False", ["True", "None", '""'],
 "Empty things (\"\", 0, [], {}) count as False. Anything with content counts as True.", "Empty = False.", "out"),
("logic", None, "= stores a value, == checks if two things are equal", ["They do the same thing", "== stores a value, = checks", "= is for numbers, == is for text"],
 "x = 5 puts 5 in x. x == 5 asks a question and answers True or False.", "One = sets, two == ask.", None),

# ---------- Loops ----------
("loops", 'for i in range(3):\n    print(i)', "0\n1\n2", ["1\n2\n3", "0\n1\n2\n3", "3"],
 "range(3) gives 0, 1, 2: three numbers, starting at 0 and stopping before 3.", "range stops before the number.", "out"),
("loops", 'total = 0\nfor n in [1, 2, 3]:\n    total += n\nprint(total)', "6", ["3", "0", "123"],
 "total += n adds each number in turn: 0 + 1 + 2 + 3. The print is outside the loop, so it runs once.", "", "out"),
("loops", 'n = 3\nwhile n > 0:\n    n -= 1\nprint(n)', "0", ["1", "3", "-1"],
 "The loop keeps going while n > 0. It stops as soon as n reaches 0.", "", "out"),
("loops", 'print(list(range(2, 8, 2)))', "[2, 4, 6]", ["[2, 4, 6, 8]", "[2, 8]", "[4, 6, 8]"],
 "range(start, stop, step): start at 2, go up by 2, stop before 8.", "", "out"),
("loops", 'for ch in "hi":\n    print(ch * 2)', "hh\nii", ["hihi", "h\ni", "hhii"],
 "Looping over text gives one letter at a time. Each print goes on its own line.", "", "out"),
("loops", 'for n in range(5):\n    if n == 3:\n        break\n    print(n)', "0\n1\n2", ["0\n1\n2\n3", "0\n1\n2\n3\n4", "3"],
 "break leaves the loop immediately, before 3 is printed.", "break = leave now.", "out"),

# ---------- Functions ----------
("funcs", 'def double(x):\n    return x * 2\n\nprint(double(4))', "8", ["4", "44", "None"],
 "double(4) runs the function with x = 4 and gives back 4 * 2.", "", "out"),
("funcs", 'def greet():\n    print("hi")\n\nresult = greet()\nprint(result)', "hi\nNone", ["hi", "None", "hi\nhi"],
 "greet() prints hi, but it has no return, so it gives back None, which the second print shows.", "No return = None.", "out"),
("funcs", 'def add(a, b=10):\n    return a + b\n\nprint(add(5))', "15", ["5", "TypeError", "510"],
 "b=10 is a default. If you don't pass b, it uses 10.", "", "out"),
("funcs", None, "Sends a value back and ends the function", ["Prints the value on screen", "Starts the function again", "Saves the value to a file"],
 "return hands a value back to whoever called the function. Nothing after it in the function runs.", "return = hand back.", None),

# ---------- Errors ----------
("errors", 'print("Age: " + 30)', "TypeError", ["Age: 30", "Age 30", "SyntaxError"],
 "You can't + text and a number. Fix it with str(30) or an f-string: f\"Age: {30}\".", "Text + number = TypeError.", "err"),
("errors", 'nums = [1, 2, 3]\nprint(nums[3])', "IndexError", ["3", "None", "KeyError"],
 "The positions are 0, 1, 2. There is no position 3.", "", "err"),
("errors", 'print(score)', "NameError", ["0", "None", "score"],
 "score was never given a value, so Python doesn't know the name.", "", "err"),
("errors", 'print(10 / 0)', "ZeroDivisionError", ["0", "inf", "10"],
 "Dividing by zero isn't allowed in Python, so it stops with an error.", "", "err"),
("errors", 'int("five")', "ValueError", ["5", "TypeError", "NameError"],
 "int() only understands digits. The type (text) is fine, but the value can't be turned into a number.", "", "err"),
]

def run(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, {})
        return buf.getvalue().rstrip("\n"), None
    except Exception as e:
        return buf.getvalue().rstrip("\n"), type(e).__name__

out, bad, counts = [], 0, {}
for t, code, a, w, why, hook, check in C:
    counts[t] = counts.get(t, 0) + 1
    cid = f"{t}{counts[t]}"
    if len(set([a] + w)) != 4:
        print("DUPLICATE OPTIONS", cid); bad += 1
    if check:
        got, err = run(code)
        real = err if check == "err" else got
        if check == "out" and err:
            print("UNEXPECTED ERROR", cid, err); bad += 1
        if real != a:
            print("WRONG ANSWER", cid, repr(a), "real:", repr(real)); bad += 1
        if real in w:
            print("WRONG OPTION IS CORRECT", cid); bad += 1
    prompt = "What does this print?" if check == "out" else "What happens when this runs?" if check == "err" else {
        "basics": "Which of these is NOT allowed as a variable name?",
        "dicts": "What does a dictionary store?",
        "logic": "What's the difference between = and ==?",
        "funcs": "What does return do inside a function?"}[t]
    out.append({"id": cid, "t": t, "q": prompt, "code": code or "", "a": a, "w": w,
                "why": why, "h": hook, "mono": check is not None or t == "basics"})

json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False)
print(f"{len(out)} cards, {sum(1 for c in C if c[6])} verified against real Python, {bad} problems")
sys.exit(1 if bad else 0)

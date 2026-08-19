# How This Code Scanner Works (Plain-English Version)

## The Basic Idea

Imagine you're checking a house for safety problems. You'd look for two
different things:

1. **Water flowing from a bad source to a bad place** — like a leak that
   starts at a cracked pipe and ends up dripping onto an electrical
   outlet. You'd trace the path from start to finish.
2. **Obvious hazards that don't need tracing** — like an unlocked door or
   an exposed wire. You just spot them directly.

This code does the same thing, but for security bugs in JavaScript
instead of leaks in a house.

- **"Bad source"** = user input, like something typed into a form
  (`req.query.name`, `req.body.email`). You can never fully trust this.
- **"Bad place" (a "sink")** = somewhere that input becomes dangerous if
  it's not cleaned up first — like directly injecting it into HTML, or
  running it as code.
- **"Cleaning it up" (a sanitizer)** = a function that makes the input
  safe, like `escapeHtml()`.

So the scanner's main question is:

> *Does untrusted data ever travel from a risky source to a risky sink,
> without passing through something that cleans it first?*

If yes → that's a bug worth flagging.

Separately, it also checks for a few things that don't need any of this
"tracing" — like passwords typed directly into the code, or cookies set
up without basic safety flags. Those are just spotted on sight, like the
unlocked door.

---

## Step by Step, In Order

### Step 1: Read the code as a tree

Code isn't read line-by-line here — it's turned into a tree structure
first (this happens before this file even runs, using a tool called
tree-sitter). Think of it like a family tree, but for the code's
structure: "this function contains this call, which contains this
argument," and so on.

A few small helper functions do the boring-but-necessary work of walking
through every branch of that tree and pulling out the actual text and
line numbers.

### Step 2: Find variables that hold user input

The scanner walks the whole tree looking for lines like:

```js
const name = req.query.name;
```

It checks: does the right-hand side come from a known "bad source" list
(things like `req.query`, `req.body`)? If yes, it remembers that
variable — in this case `name` — as **tainted**, along with which line
it came from.

This check is pretty simple on purpose: it's just matching text patterns
like `req.query`. It's not smart enough to track a variable across
reassignments or through different code branches — it only looks at how
a variable was first declared.

### Step 3: Look for dangerous places that use tainted variables

Now it walks the tree again, this time looking for three kinds of risky
spots:

- **Function calls** that are known to be dangerous with untrusted input
  — like `eval(...)`.
- **Direct assignments** to dangerous properties — like
  `element.innerHTML = ...`.
- **Object construction** that can run code — like
  `new Function(...)`.

For each one it finds, it checks: is a tainted variable being used here?
And — this is the important part — **was it cleaned up first?**

To check "was it cleaned up," the code looks for a call to a known-safe
function (like `escapeHtml(name)`) wrapped around the tainted variable.
If it finds one, it stops looking right there — it doesn't matter that
`name` is tainted, because it was passed through a cleaner on the way.
If there's no cleaner in the way, it's flagged as a real problem.

### Step 4: Report the problem

Every flagged issue records:
- Where the risky data came from (file + line + the actual code snippet)
- Where it ended up being used dangerously (same info)
- What *type* of problem it is (e.g. "Cross-Site Scripting")
- How *severe* it is (this is new — every finding used to be missing
  this, which meant the dashboard's severity chart had nothing to show)

### Step 5: Also check for standalone problems (no tracing needed)

These three checks don't care about "sources" or "tainted variables" at
all — they run every time, independently:

1. **Hardcoded secrets** — a variable like `apiKey = "sk_live_abc123..."`
   sitting directly in the code. Flagged either because the variable
   name sounds secret-ish (and the value is long enough to be real), or
   because the value itself matches the known shape of a real secret
   (like an AWS key format).

2. **Weak encryption** — code that calls something like
   `createHash("md5")` or `createHash("sha1")` — algorithms that are
   considered outdated and easy to crack.

3. **Unsafe cookies** — code that sets a cookie (`res.cookie(...)`)
   without turning on basic safety settings like `httpOnly` and
   `secure`.

### Step 6: Put it all together

For every file, the scanner:
1. Finds all the tainted variables.
2. Always runs the three standalone checks.
3. Only bothers tracing sources→sinks *if* it actually found at least one
   tainted variable — no point searching for a leak's destination if
   there's no leak to begin with. This keeps it fast.

Then it does this for every file you give it, and combines all the
results into one list.

---

## What It's Good At vs. What It Misses

**Good at:**
- Catching the classic, common bugs — unescaped user input hitting HTML,
  `eval`, unsafe cookies, secrets left in code, weak hashing.
- Being fast and predictable — same input always gives the same output,
  no AI guesswork involved.

**Misses (on purpose, as trade-offs for speed and simplicity):**
- It only looks within **one file at a time** — if tainted data gets
  passed into another file, it won't follow it there.
- It doesn't understand **if/else branches** — it won't notice that a
  variable got cleaned up inside an `if` block.
- It only checks a variable's **first assignment** — if you reassign it
  later (`name = req.query.y` after it was already declared), that new
  taint won't be picked up.
- "Cleaning" is only recognized when it's an actual function call
  wrapped around the value — other ways of making data safe (like
  checking it against an allowed list) aren't understood.
- Spotting "bad sources" is just text matching (does it start with
  `req.query.`?) — not a deep understanding of what the code actually
  does.

None of these are bugs exactly — they're deliberate simplifications that
keep the scanner fast and easy to reason about, at the cost of missing
some more complicated real-world cases.
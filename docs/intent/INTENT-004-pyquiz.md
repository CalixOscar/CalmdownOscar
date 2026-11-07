# INTENT-004 — PyLearn Quiz

**Date:** 2026-11-07
**Author:** Claude (Opus 5.5), from the founder's requests in this session
**Status:** settled
**Intent read:** not run (founder chose a light Tier 2: plan + Codex pre-mortem + post-mortem)
**Plan:** docs/PLAN-pyquiz.md

## The problem

The founder wants to learn Python. Bianca's exam quiz (`/biancaexam/`) worked: short
multiple-choice rounds on a phone, missed cards come back, offline. He wants the same
setup for Python. The LearnPy pilot (`/playground/learnpy/`) stalled because running
real Python safely in the browser is unresolved, and its simulator only covers a tiny
subset.

## Who hits it, and when

The founder, on his phone in spare minutes, often without a reliable connection.

## What "solved" looks like

He opens calmdownoscar.com/pyQuiz, installs it to the home screen, and drills about
110 cards across beginner topics. Every "what does this print / what happens" answer
is exactly what real Python does. It keeps working in airplane mode. A 50:50 helper
can be switched on when a topic is new. The playground page tells visitors it exists.

## How it should feel

Calm, quick, one question at a time, with an explanation after every answer.
Avoid: a gamified streak-chasing app, a course platform with accounts, an editor
that pretends to run Python.

## Out of scope

Running user code, accounts, sync, analytics, any server, new libraries.

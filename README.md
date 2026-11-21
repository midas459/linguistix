## Project overview

**Linguistix** is a language-learning application intended to make consistent practice more approachable, measurable, and engaging. Its central goal is to help learners move beyond passively reading vocabulary lists by giving them a repeatable learning loop: encounter useful words and phrases, practise recalling them, receive feedback, revisit difficult material, and track progress over time.

The long-term product direction is a flexible learning environment rather than a static dictionary. Learning content can be organized by language, topic, level, and practical situation. Short sessions should make it possible to practise regularly, while review logic should bring back material that a learner has not yet mastered. Explanations and examples should prioritize clarity and real usage, with room for listening, pronunciation, and contextual exercises as the product matures.

A useful session should have a clear beginning and end. The learner should know what they are practising, be able to submit an answer, understand why it is correct or needs improvement, and see a meaningful summary at the end. Progress should be stored safely and associated with the correct account if authentication is introduced. The interface should work well on both desktop and mobile screens and should avoid overwhelming new learners with too many controls.

The repository currently uses a Base44-hosted TanStack Start foundation with React 19 and JavaScript. That describes the current technical starting point, not proof that every planned learning feature is already implemented. The next engineering stage is to audit the starter routes and services, then build and test the complete practice loop, content model, session scoring, and persistence.

## Product principles

- Make daily practice short, clear, and repeatable.
- Teach through active recall and useful context.
- Give feedback that explains the answer.
- Track progress honestly and make review useful.
- Label planned features separately from working functionality.
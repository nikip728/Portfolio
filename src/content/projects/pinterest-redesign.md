---
title: Pinterest Mobile Redesign — Discovery and Visual Clarity
summary: A self-initiated redesign of the Pinterest app focused on improving promoted content clarity, simplifying navigation, and exploring the trade-offs of removing chat.
order: 2
recencyOrder: 2
published: true
tags:
  - Figma
  - UI/UX
  - Redesign
cover: /images/projects/pinterest-redesign/pinterest-redesign-main.png
prototype: https://www.figma.com/proto/DlGXeU2dgPF1moXCb4toK9/Pinterest-redesign?node-id=22-94&p=f&t=4yO88zOIZQQaNwel-0&scaling=min-zoom&content-scaling=fixed&page-id=22%3A3&starting-point-node-id=22%3A94
caseStudy: /images/projects/pinterest-redesign/case-study.png
details:
  role: UX research and design
  workedWith: "Independent portfolio project"
  scope: Survey, personas, wireframes, and high-fidelity interface design
  platform: Mobile app concept
---
## Project Background

As a regular Pinterest user, I noticed that the growing amount of AI-generated and promoted content made it increasingly difficult to distinguish between different types of pins. This inspired me to explore how the app could offer a clearer and less distracting browsing experience.

The goal of this self-initiated redesign was to improve the overall user experience by making content discovery more intuitive, simplifying navigation, and reconsidering existing features. The project focused on the mobile app and was developed independently as an unofficial design concept.


## Research and its limits

To better understand how people use Pinterest, I conducted a short Google Forms survey with 20 respondents. I shared the questionnaire in a group intended for this purpose at my workplace at the time. The questions focused on their usage habits, what they liked and disliked about the platform, and what they would change.

I recorded the responses in three mind maps, which I still have in Figma. They group feedback around what people liked, what annoyed them, and what they would change:

- **What people valued:** inspiration, the quantity and variety of images, personalised recommendations, search, and infinite scrolling.
- **What caused frustration:** ads being confused with ordinary content, too much advertising and AI content, hidden website links, annoying notifications, and poor recommendations below a pin.
- **Suggested changes:** clearer distinctions between ads and other content, a smaller notification indicator, a stronger focus on pictures, more precise and personalised search, and Meta account linking.

The maps preserve the themes, but do not show how many respondents mentioned each one. I use them to explain my design direction rather than assign numerical rankings to the issues.

I created two simplified user personas entirely from the questionnaire responses, using no invented details. They summarise different usage patterns: Janet reflects users who primarily browse Pinterest for inspiration and save visually appealing content, while Matthew represents users who actively collect and organise ideas into boards and value a more structured browsing experience.

![A Picture of the 2 personas](/images/projects/pinterest-redesign/pinterest-redesign-personas.png)

The survey responses helped inform the redesign direction, particularly the improvements aimed at making content labels more noticeable and the browsing experience clearer. I also treated my own experience with Pinterest as one perspective among many rather than assuming it represented the wider user base.

The research had limitations. With 20 respondents recruited through a workplace group, the findings cannot be considered representative of Pinterest's broader audience. A larger and more diverse participant group would have provided a stronger foundation for validating the identified patterns and design decisions.

## Problem framing

The maps show that respondents valued discovery and inspiration while also reporting frustration with the content mixed into that experience. I therefore focused on helping people recognise what they were opening while keeping images central to the interface.

I also remember survey feedback questioning the usefulness of the chat feature, although that point is not recorded in the three retained maps. The maps do record a suggestion for Meta account linking. Search precision and recommendations below a pin were further concerns; evaluating the underlying recommendation system was outside this visual redesign.

These insights informed a more focused design direction: simplifying the browsing experience and reducing unnecessary distractions. More accurate image tagging was also considered as a potential way to improve recommendation relevance, although this was outside the scope of the visual redesign.

These were design priorities for the concept, not claims that the proposed changes would solve the underlying recommendation challenges.

## Design decisions and tradeoffs

My main design priority was to make visual content the primary focus of the interface. I reduced the number of visible buttons and slightly increased image sizes, giving pins more space and reducing competition from surrounding UI elements.

I grouped the main navigation actions, including the search shortcut, in a simplified bottom bar. My aim was to make these controls easier to reach with the thumb during one-handed use. The search field itself remains at the top of the search screen. This was an ergonomic design intention that I did not validate through usability testing.

I also intended to reduce unrelated recommendations in the interface concept. The project consists of interface designs and a Figma prototype, with no backend or implemented search or recommendation system.

To improve content transparency, I introduced a dedicated label bar at the bottom of pins containing non-standard content, such as promoted posts, AI-generated images, and external links. Regular organic pins remain unlabelled, allowing these indicators to stand out and help users recognise content that differs from a standard Pinterest pin before opening it.

The labels respond to confusion about ads and hidden links. Labelling AI images addresses identification, but does not reduce their quantity, which was a separate concern in the feedback. The concept also assumes that reliable information about an image's origin is available; I did not design or validate a detection system.

I also removed the in-app chat feature to keep the experience focused on Pinterest's core purpose: discovering, saving, and organising ideas. Following a suggestion from one survey respondent, I designed an account-linking option in Settings so people with similar interests could connect through an external service. This remained an interface concept; I did not implement an external messaging integration.

This decision comes with a tradeoff: removing direct messaging may inconvenience users who rely on Pinterest to communicate or collaborate. However, the redesign prioritises a more focused discovery experience over expanding its social functionality.

Removing in-app chat was also intended to reduce chat-related notifications. This was an expected effect of the concept, not a measured reduction, and it would not address notifications from other parts of the app.

### Published Pinterest references and my concept

| Pinterest reference — Home | My concept — Home | Pinterest reference — Search | My concept — Search |
| --- | --- | --- | --- |
| ![Published Pinterest mobile home feed with a two-column image grid and bottom navigation.](/images/projects/pinterest-redesign/pinterest-reference-home.png) | ![My home screen concept with three bottom navigation icons and an Ad label over a feed image.](/images/projects/pinterest-redesign/redesign-home.png) | ![Published Pinterest search screen with a top search field, a featured idea and recommendation sections.](/images/projects/pinterest-redesign/pinterest-reference-search.png) | ![My search screen concept with a top search field and compact groups of ideas for characters, backgrounds and DND.](/images/projects/pinterest-redesign/redesign-search.png) |

- **Content identification:** survey feedback described ads being confused with other content. My home screen places an explicit “Ad” label on the image. The selected reference feed contains no visible ad, so it illustrates the surrounding interface rather than an existing ad label.
- **Search layout:** my concept keeps the search field above compact, topic-based groups. The published Pinterest reference also has a search field and a bottom search shortcut; a comparison of the complete interaction paths would be needed to assess the number of steps.

Reference images: [Pinterest Business — How to make Pins](https://business.pinterest.com/how-to-make-pins/), accessed 8 November 2026. The page does not state when these screens were captured, so I use them as published references rather than verified captures of the version I originally redesigned. The reference images are credited to Pinterest; only transparent side margins were removed for alignment. My concept screens are unaltered Figma exports.

## High-fidelity design and deliverable

I developed the low-fidelity wireframes into more detailed high-fidelity screens, particularly expanding areas such as the profile and settings pages. These screens explore additional interface details, including profile settings and the process of uploading images.

The browsing and search screens retain a minimal UI, keeping the focus on the images rather than surrounding interface elements. The overall visual direction remains clean and minimal across the different sections.

The Figma prototype demonstrates a basic user workflow: saving an image to a board and then uploading an image through the profile page. This provides an example of how users can interact with the proposed interface.

The prototype and visual case study present the final design concept. However, the redesign was not usability-tested, so improvements to clarity and ease of use have not been validated with users.

## Reflection and next steps

The project gave me practice connecting early research to interface decisions and presenting a complete redesign concept.

A next step would be to compare the concept with the existing experience using tasks around identifying promoted content, saving ideas, and finding saved pins. Research should include people who use messaging as well as those who do not, so the cost of removing chat can be evaluated rather than assumed away.

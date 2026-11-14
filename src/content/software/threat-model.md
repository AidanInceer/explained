---
minutes: 8
tech: []
refs:
  - seceng: Ch. 2, “Who Is the Opponent?”, and Ch. 27, “Secure Systems Development”
  - owasp: Introduction, and A04, “Insecure Design”
---
Security is not a feature that you add at the end. It is a way of looking at a system: what is worth stealing or breaking, who might try, and how they would get in. **Threat modelling** is the habit of asking these questions while you design, when fixes are cheap, instead of after an attack, when they are not.

## Four questions

A simple, widely used method asks:

1. **What are we building?** Draw the system: users, apps, services, databases, outside partners, and the data that flows between them.
2. **What can go wrong?** For each part and each flow, imagine an attacker.
3. **What are we going to do about it?** Choose defences for the risks that matter.
4. **Did we do a good job?** Check the defences, and repeat when the design changes.

## What is valuable

Start from the **assets**: what an attacker wants.

- Personal data: names, addresses, health records.
- Money, or the power to move it.
- Credentials and keys that open other systems.
- The service itself: taking it down, or using it to attack others.

The value decides the effort. A recipe blog and a hospital system need very different care.

## Who and how

Attackers range from automated bots that try every known weakness on every site, to criminals after money, to insiders with legitimate access. Most attacks are not clever. They use:

- **Stolen or weak passwords**, and accounts with no second factor.
- **Known bugs** in software that was never updated.
- **Input the system trusted** and should not have: the subject of [Common web attacks](/lesson/web-attacks).
- **Mistakes in configuration**: a storage bucket open to the public, a debug page left on.
- **People**: an email that tricks someone into giving a password.

## Trust boundaries

A **trust boundary** is where data crosses from something you do not control into something you do: from the browser to your server, from a partner's API into your database, from a file upload into your code. Every boundary needs checks. Anything from the other side can be wrong or hostile, even if your own app sent it, because an attacker can send requests without your app.

> **Rule of thumb.** Never trust the client. Any check in the browser or the phone app is for the user's convenience. The real check must happen on the server.

## Defence in depth

No single defence is perfect. Layer them, so that one failure does not mean a breach: strong sign-in, then [least privilege](/lesson/least-privilege) so a stolen account can do little, then encryption so stolen data is hard to read, then logging and alerts so an attack is noticed.

## Remember

- Ask: what are we building, what can go wrong, what will we do, did it work?
- Start from the assets. Their value sets the effort.
- Most attacks use stolen passwords, old bugs, trusted input and mistakes.
- Check everything that crosses a trust boundary. Layer defences.

::quiz
? A web form checks in JavaScript that the quantity is between 1 and 10. Is that enough?
+ No: an attacker can send any request directly, so the server must check too
- Yes: the browser always runs the check
- Yes, if the form uses HTTPS
! Client-side checks are for convenience. Requests can be made without the app, so the server must validate.
? What is the best first step when you threat-model a new feature?
+ Draw the parts and data flows, and list what is valuable
- Buy a firewall
- Encrypt everything
! You cannot choose defences until you know what you protect and where data crosses boundaries.
::end

---
minutes: 9
tech: []
refs:
  - kurose: Ch. 1, “Computer Networks and the Internet”
  - kurose: 'Ch. 3, “Transport Layer”, and Ch. 4, “The Network Layer: Data Plane”'
---
Almost all software today talks to other computers: a phone app to a server, a server to a database, one service to another. The network decides how fast and how reliably this works. You do not need to build a network to write software, but you need to know what it can and cannot promise.

## Data travels in packets

The internet does not keep a wire open between two computers. It cuts data into **packets**: small pieces, usually under 1,500 bytes, each with an address. Each packet travels on its own, and many computers' packets share the same cables.

This is why the internet is cheap and robust. If one cable fails, packets take another way. But it also means that packets can arrive late, out of order, twice, or not at all.

## Addresses

Each device on the internet has an **IP address**. An IPv4 address is 32 bits, written as four numbers such as `203.0.113.7`. There are only about 4 billion of them, which is not enough, so the newer **IPv6** uses 128 bits.

One computer runs many programs that use the network. A **port** number, from 0 to 65,535, picks the program. A web server usually listens on port 443 for HTTPS. So a full address for a conversation is an IP address and a port.

## How a packet finds its way

Between your laptop and a server there are many **routers**: computers that pass packets on. A router does not know the whole route. It looks at the destination address and sends the packet one step closer, to the next router. A packet often takes 10 to 20 such steps, called **hops**.

Each hop adds a little time, and distance adds more. Light in fibre takes about 5 milliseconds for each 1,000 km, so a reply from another continent always takes tens of milliseconds, however fast the computers are.

> **Rule of thumb.** Count the round trips. An app that makes 20 requests, one after the other, to a server 100 ms away waits 2 seconds, even if each request is tiny.

## Layers

The network is built in **layers**. Each layer uses the one below and hides its details from the one above.

| Layer | Job | Examples |
|---|---|---|
| Application | What the programs say to each other | HTTP, DNS, SMTP |
| Transport | A conversation between two programs | TCP, UDP |
| Network | Move a packet across many networks to an address | IP |
| Link | Move bits across one cable or radio link | Ethernet, Wi-Fi |

## TCP and UDP

Most programs want a stream of bytes that arrives complete and in order. **TCP** gives this on top of unreliable packets. The receiver sends back an acknowledgement for the data it got. The sender sends again what was not acknowledged, and the receiver puts everything back in order. TCP also slows down when the network is full.

**UDP** sends single packets with no promises. It is used where a late packet is worse than a lost one, such as voice calls and games, and as the base of newer protocols.

> **For experienced readers.** HTTP/3 runs over QUIC, which is built on UDP. QUIC does its own ordering and retries for each stream, so one lost packet does not hold up every other stream on the connection.

## Remember

- Data travels in small packets that can be late, lost or out of order.
- An IP address finds the computer. A port finds the program.
- Routers pass packets on, one hop at a time. Distance sets a minimum delay.
- TCP makes a reliable, ordered stream. UDP sends single packets with no promises.

::quiz
? A server is 3,000 km away. Why can a request never get a reply in 1 millisecond?
- Routers are slow
+ Light in fibre needs about 15 ms each way over that distance
- TCP waits one second before it sends
! The speed of light in fibre sets a minimum. 3,000 km takes about 15 ms one way, so about 30 ms there and back.
? What does TCP add on top of IP packets?
- Encryption
+ Retries and ordering, so that the bytes arrive complete and in order
- A faster route
! IP delivers packets on a best-effort basis. TCP acknowledges, resends and reorders them to give a reliable stream.
::end

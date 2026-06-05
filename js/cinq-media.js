(function () {
  var nav = document.querySelector("[data-site-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var forms = document.querySelectorAll("[data-brief-form]");
  var storyFeeds = document.querySelectorAll("[data-story-feed]");
  var storyDetail = document.querySelector("[data-story-detail]");

  function setToggleIcon(isOpen) {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.innerHTML = isOpen
      ? '<i class="fa fa-times" aria-hidden="true"></i><span class="sr-only">Close menu</span>'
      : '<i class="fa fa-bars" aria-hidden="true"></i><span class="sr-only">Open menu</span>';
  }

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    setToggleIcon(false);
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var isOpen = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("nav-open", isOpen);
      setToggleIcon(isOpen);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  function escapeHtml(value) {
    var node = document.createElement("div");
    node.textContent = value == null ? "" : String(value);
    return node.innerHTML;
  }

  function formatStoryTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Timestamp pending";

    return (
      date.toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Africa/Nairobi",
      }) + " EAT"
    );
  }

  function sortStories(stories) {
    return stories.slice().sort(function (a, b) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  function renderStoryCard(story, index, featureFirst) {
    var isFeatured = featureFirst && index === 0;
    var href = story.href || "blog-single.html?story=" + encodeURIComponent(story.id);
    var meta = [
      story.location,
      story.readMinutes ? story.readMinutes + " min read" : "",
    ]
      .concat(Array.isArray(story.tags) ? story.tags.slice(0, 3) : [])
      .filter(Boolean)
      .map(function (item) {
        return "<span>" + escapeHtml(item) + "</span>";
      })
      .join("");

    return (
      '<article class="article-card' +
      (isFeatured ? " featured" : "") +
      '">' +
      '<img src="' +
      escapeHtml(story.image) +
      '" alt="' +
      escapeHtml(story.alt || story.title) +
      '" />' +
      "<div>" +
      '<span class="tag">' +
      escapeHtml(story.category || "Story") +
      "</span>" +
      "<h3>" +
      escapeHtml(story.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(story.deck) +
      "</p>" +
      '<div class="article-meta"><span><i class="fa fa-clock-o" aria-hidden="true"></i> <time datetime="' +
      escapeHtml(story.publishedAt) +
      '">' +
      escapeHtml(formatStoryTime(story.publishedAt)) +
      "</time></span>" +
      meta +
      "</div>" +
      '<a class="button button-primary" href="' +
      escapeHtml(href) +
      '">Read brief</a>' +
      "</div>" +
      "</article>"
    );
  }

  function renderStoryFeeds(stories) {
    storyFeeds.forEach(function (feed) {
      var limit = parseInt(feed.getAttribute("data-story-limit"), 10) || stories.length;
      var featureFirst = feed.getAttribute("data-story-featured") !== "false";
      feed.innerHTML = stories
        .slice(0, limit)
        .map(function (story, index) {
          return renderStoryCard(story, index, featureFirst);
        })
        .join("");
    });
  }

  function setText(container, selector, value) {
    var node = container.querySelector(selector);
    if (node) node.textContent = value || "";
  }

  function renderStoryDetail(stories) {
    if (!storyDetail) return;

    var params = new URLSearchParams(window.location.search);
    var requestedId = params.get("story");
    var story =
      stories.find(function (item) {
        return item.id === requestedId;
      }) || stories[0];

    if (!story) return;

    document.title = story.title + " | Cinq Media Journal";
    setText(storyDetail, "[data-story-category]", story.category || "Journal Feature");
    setText(storyDetail, "[data-story-title]", story.title);
    setText(storyDetail, "[data-story-deck]", story.deck);
    setText(storyDetail, "[data-story-location]", story.location);
    setText(storyDetail, "[data-story-read]", story.readMinutes ? story.readMinutes + " min read" : "");
    setText(storyDetail, "[data-story-time]", formatStoryTime(story.publishedAt));

    var time = storyDetail.querySelector("[data-story-time]");
    if (time) time.setAttribute("datetime", story.publishedAt || "");

    var image = storyDetail.querySelector("[data-story-image]");
    if (image) {
      image.setAttribute("src", story.image || "");
      image.setAttribute("alt", story.alt || story.title || "");
    }

    var hero = storyDetail.querySelector(".page-hero");
    if (hero && story.image) {
      hero.style.backgroundImage =
        'linear-gradient(90deg, rgba(0, 0, 0, 0.84), rgba(0, 0, 0, 0.36)), url("' +
        story.image +
        '")';
    }

    var body = storyDetail.querySelector("[data-story-body]");
    if (body && Array.isArray(story.body)) {
      body.innerHTML = story.body
        .map(function (paragraph) {
          return "<p>" + escapeHtml(paragraph) + "</p>";
        })
        .join("");
    }
  }

  if (storyFeeds.length || storyDetail) {
    fetch("data/stories.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load stories.");
        return response.json();
      })
      .then(function (stories) {
        var sorted = sortStories(stories);
        renderStoryFeeds(sorted);
        renderStoryDetail(sorted);
      })
      .catch(function () {
        /* Keep the HTML fallback content visible if the story feed cannot load. */
      });
  }

  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var note = form.querySelector("[data-form-note]");
      var subject = data.get("subject") || "Project brief for Cinq Media";
      var lines = [
        "Name: " + (data.get("name") || ""),
        "Email: " + (data.get("email") || ""),
        "Organisation: " + (data.get("organisation") || ""),
        "Project type: " + (data.get("type") || ""),
        "Timeline: " + (data.get("timeline") || ""),
        "",
        "Brief:",
        data.get("message") || "",
      ];
      var mailto =
        "mailto:desk@cinqmedia.co.ke?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));

      if (note) {
        note.textContent = "Opening your email app with the brief prepared.";
      }

      window.location.href = mailto;
    });
  });
})();

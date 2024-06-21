(function() {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  const scrollto = (el) => {
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos,
      behavior: 'smooth'
    })
  }

  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  window.addEventListener("scroll", function() {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > 0) {
      document.querySelector('.navbar').classList.remove('hidden');
    } else {
      document.querySelector('.navbar').classList.add('hidden');
    }
  }, false);

  document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('.navbar').classList.add('hidden');
  });

  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  const typed = select('.typed')
  const typedMobile = select('.typed-mobile')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  if (typedMobile) {
    typedMobile.textContent = "I am a Full-stack Developer";
  }

  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  });

  const myTags = [
    'JavaScript', 'React', 'Redux', 'Node', 'Express', 'jQuery', 'HTML5', 'CSS3',
    'Bootstrap', 'Python', 'PHP', 'MySQL', 'PostgreSQL', 'GitHub', 'GSAP', 'Figma', 'VSCode', 'Netlify'
  ];

  let tagCloud = TagCloud('.tagcloud-content', myTags, {
    radius: 300,
    maxSpeed: 'normal',
    initSpeed: 'fast',
    direction: 135,
    keep: true
  });

  const colors = ['#fa4eab', '#64FFDA', '#fff'];

  function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function updateTagColors() {
    const tags = document.querySelectorAll('.tagcloud-content span');
    tags.forEach(tag => {
      tag.style.color = getRandomColor();
      tag.style.transition = 'color 1s';
    });
  }

  updateTagColors();
  setInterval(updateTagColors, 2000);

  $('#contact-form').on('submit', function(e) {
    e.preventDefault();
    $('.loading').show();
    $('.error-message, .sent-message').hide();
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: $(this).serialize(),
      success: function(response) {
        $('.loading').hide();
        if (response.includes('success')) {
          $('.sent-message').show();
          $('#contact-form')[0].reset();
        } else {
          $('.error-message').html('There was an error sending your message. Please try again.').show();
        }
      },
      error: function() {
        $('.loading').hide();
        $('.error-message').html('There was an error sending your message. Please try again.').show();
      }
    });
  });

  $('#certificationsLink').on('click', function(e) {
    e.preventDefault(); 
    $('#certificationsModal').css('display', 'block'); 
    document.body.style.overflow = 'hidden'; 
  });

  $('.close').on('click', function() {
    $('#certificationsModal').css('display', 'none'); 
    document.body.style.overflow = 'auto'; 
  });

  window.onclick = function(event) {
    if (event.target === document.getElementById('certificationsModal')) {
      $('#certificationsModal').css('display', 'none');
      document.body.style.overflow = 'auto';
    }
  };

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      $('#certificationsModal').css('display', 'none');
      document.body.style.overflow = 'auto';
    }
  });

  on('click', 'a[href="#"]', function(e) {
    e.preventDefault();
  });

})();


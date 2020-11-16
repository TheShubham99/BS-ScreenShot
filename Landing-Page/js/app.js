const demoEle = { lastMsgGroup: null };

const users = {
  shubham: {
    username: 'TheShubham99',
    nameColor: 'hsl(345, 50%, 52%)',
    avatar: 'https://cdn.discordapp.com/avatars/627476426026909696/51e7c2679a7bfc8dc00204d8067c8b87.png?size=128' 
},

  snapbot: {
    username: 'SnapBot',
    nameColor: 'hsl(212, 51%, 59%)',
    bot: true,
    avatar: 'https://cdn.discordapp.com/avatars/775333766141837313/7b3e00d0c69e4d83b49d0b2ec43b841f.png?size=256' 
} };



const channelData = [
{
  name: 'general',
  selected: true,
  messages: [
  {
    type: 'input',
    text: 'What you do?',
    user: users.shubham },
  {
    type: 'message',
    delay: 350,
    user: users.snapbot,
    embedData: {
      title: `-=-=-=-=-= Help =-=-=-=-=-\n\n`,
      pill: 'hsl(202, 35%, 68%)',
      thumb: null,
      fields: [
      {
        name: 'What I do?',
        value: "It's a simple discord bot built to see how a particular website looks on a particular device. The bot is Powered by @BrowserStack's ScreenShot API." },
      ] } }] },




      {
        name: 'music',
        selected: true,
        messages: [
        {
          type: 'input',
          text: 'What you do?',
          user: users.shubham },
        {
          type: 'message',
          delay: 350,
          user: users.snapbot,
          embedData: {
            title: `-=-=-=-=-= Help =-=-=-=-=-\n\n`,
            pill: 'hsl(202, 35%, 68%)',
            thumb: null,
            fields: [
            {
              name: 'What I do?',
              value: "It's a simple discord bot built to see how a particular website looks on a particular device. The bot is Powered by @BrowserStack's ScreenShot API." },
            ] } }] },
      
      

];




const bracketsReplaceRegex = /\[(\S*)\s?(.*?)?\]/g;
const bracketsSplitRegex = /([^"\s]+)|("[^"]*")/g;
const numberTestRegex = /^[\d.]+$/g;

let canAddMessages = true;
let currentlyLoading = false;
let currentChannel = null;

function delay(time = 0) {
  if (!time) {
    return Promise.resolve();
  }
  return new Promise(resolve => setTimeout(resolve, time));
}

function errorHandle(err) {
  if (err instanceof Error) {
    console.log(err);
  }
}

function clearInput() {
  demoEle.input.value = '';
}


function clearMessages() {
  if (!canAddMessages || demoEle.lastMsgGroup === null) {
    return Promise.resolve();
  }
  demoEle.lastMsgGroup = null;
  canAddMessages = false;
  demoEle.messages.classList.add('hide');
  return delay(300).
  then(() => {
    demoEle.messages.innerHTML = '';
    demoEle.messages.classList.remove('hide');
    canAddMessages = true;
  });
}

function scrollMessages() {
  let startY = demoEle.messagesWrapper.scrollTop;
  let endY = demoEle.messages.scrollHeight - demoEle.messagesWrapper.clientHeight;
  demoEle.messagesWrapper.scroll({ top: endY, left: 0, behavior: 'smooth' });
}

function createEmbed(embed, embedData) {
  let {
    title: titleText = '',
    pill: pillColor = 'hsl(0, 0%, 50%)',
    footerIcon: footerIconURL = '',
    footer: footerText = '',
    thumb: thumbURL = null,
    fields: fieldList = [] } =
  embedData;
  let pill = createElement({ classes: 'embed-pill', parent: embed, style: { backgroundColor: pillColor } });
  let rich = createElement({ classes: 'embed-rich', parent: embed });
  let content = createElement({ classes: 'embed-content', parent: rich });
  let footerContainer = createElement({ parent: rich, style: { height: footerText ? '18px' : '0px' } });
  let footerIcon = createElement({ tagName: 'img', classes: 'embed-footer-icon', attrs: { width: 20, height: 20 } });
  if (footerIconURL) {
    footerIcon.onload = () => (footerIcon.width = footerIcon.naturalWidth, footerIcon.height = footerIcon.naturalHeight);
    footerIcon.src = footerIconURL;
    footerContainer.appendChild(footerIcon);
  }
  let footer = createElement({ tagName: 'span', classes: 'embed-footer', parent: footerContainer, text: footerText });
  let innerContent = createElement({ classes: 'embed-inner-content', parent: content });
  let thumb = createElement({ tagName: 'img', classes: 'embed-thumb', attrs: { width: 80, height: 80 } });
  let title = createElement({ classes: 'embed-title', parent: innerContent, text: titleText });
  let fields = createElement({ classes: 'embed-fields', parent: innerContent });
  if (thumbURL) {
    thumb.onload = () => (thumb.width = thumb.naturalWidth, thumb.height = thumb.naturalHeight);
    thumb.src = thumbURL;
    content.appendChild(thumb);
  }
  if (fieldList.length) {
    fieldList.forEach(({ name, value, inline }) => {
      let fieldClasses = ['embed-field'];
      if (inline) {
        fieldClasses.push('embed-field-inline');
      }
      let field = createElement({ classes: fieldClasses, parent: fields });
      let nameEle = createElement({ classes: 'embed-field-name', parent: field, text: name });
      let valueEle = createElement({ classes: 'embed-field-value', parent: field, text: value });
    });
  }
  return { embed, embedData, pill, rich, content, footerContainer, footerIcon, footer, thumb, innerContent, title, fields };
}

function createMessageGroup(opts = {}) {
  let {
    avatar: avatarUrl = '',
    username: name = '',
    nameColor = '',
    bot = false } =
  opts;
  let group = createElement({ classes: 'message-group' });
  let avatar = createElement({ classes: 'avatar', parent: group });
  let comment = createElement({ classes: 'comment', parent: group });
  let usernameWrapper = createElement({ classes: 'username-wrapper', parent: comment });
  let username = createElement({ classes: 'username', text: name, parent: usernameWrapper });
  let botTag = createElement({ classes: 'bot-tag' });
  let date = new Date();
  let time = `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
  let timestamp = createElement({ classes: 'timestamp', text: 'Today at ' + time, parent: usernameWrapper });
  let out = {
    group, avatar, comment, usernameWrapper, username, timestamp,
    name, bot, date };

  if (bot) {
    usernameWrapper.appendChild(botTag);
    out.botTag = botTag;
  }
  if (avatarUrl) {
    avatar.style.backgroundImage = `url(${avatarUrl})`;
  }
  if (nameColor) {
    username.style.color = nameColor;
  }
  return out;
}

function createMessage(opts = {}) {
  let { text = '', embedData = null } = opts;
  let message = createElement({ classes: 'message' });
  let body = createElement({ classes: 'body', parent: message });
  let messageText = createElement({ classes: 'message-text', text, parent: body });
  let embed = createElement({ classes: 'embed' });
  let embedContent = null;
  if (embedData) {
    message.appendChild(embed);
    embedContent = createEmbed(embed, embedData);
  }
  return { message, body, messageText, embed, embedContent };
}

function showElement(ele) {
  ele.classList.add('animate-in');
}

function addMessage(opts = {}) {
  if (!canAddMessages) {
    console.log('Cannot add message currently');
    return Promise.reject(false);
  }
  let {
    username = '',
    lastMsgGroup = null } =
  opts;
  let prom = Promise.resolve();
  if (lastMsgGroup === null) {
    lastMsgGroup = demoEle.lastMsgGroup;
    if (lastMsgGroup === null || lastMsgGroup.name !== username) {
      lastMsgGroup = createMessageGroup(opts);
      demoEle.messages.appendChild(lastMsgGroup.group);
      demoEle.lastMsgGroup = lastMsgGroup;
      prom = delay(50).
      then(() => showElement(lastMsgGroup.group));
    }
  }
  let message = createMessage(opts);
  lastMsgGroup.comment.appendChild(message.message);
  prom = delay(25).
  then(() => {
    lastMsgGroup.group.style.maxHeight = 'none';
    showElement(message.message);
    setTimeout(scrollMessages, 35);
  });
}

function setChannel(name) {
  demoEle.channelName.innerText = name;
  demoEle.input.placeholder = `Message #${name}`;
  demoEle.channelsList.forEach(n => n.classList.remove('selected'));
  demoEle.channelsList.find(n => n.innerText === name).classList.add('selected');
  return delay(50);
}

function loadChannel(opts = {}) {
  let {
    name = 'general',
    messages = [] } =
  opts;
  if (name === currentChannel || currentlyLoading || !canAddMessages) {
    return Promise.reject(false);
  }
  currentlyLoading = true;
  currentChannel = name;
  return setChannel(name).
  then(() => clearMessages()).
  then(() => delay(200)).
  then(() => {
    let prom = Promise.resolve();
    messages.forEach(n => {
      let {
        type = 'message',
        user = { username: 'User' },
        text = '',
        delay: delayTime = 0 } =
      n;
      if (type === 'input') {
        prom = prom.then(() => delay(delayTime)).
        then(() => delay(250)).
        then(clearInput).
        then(() => addMessage(Object.assign({}, user, n)));
      } else
      if (type === 'message') {
        prom = prom.then(() => delay(delayTime)).
        then(() => addMessage(Object.assign({}, user, n)));
      }
    });
    return prom.then(() => currentlyLoading = false);
  });
}

window.addEventListener('load', () => {
  // Preload avatars
  Object.values(users).forEach(n => document.createElement('img').src = n.avatar);
  let root = document.getElementById('demo');
  let app = root.querySelector('.discord-app');
  let elements = {
    root,
    app,
    invite: '.invite-now',
    guildName: [app, '.channels .header'],
    channels: [app, '.channel-wrapper'],
    channelName: [app, '.chat .header'],
    messagesWrapper: [app, '.chat .messages-wrapper'],
    messages: [app, '.chat .messages'],
    input: [app, '.chat .input textarea'] };

  let _ele = Object.keys(elements).reduce((p, key) => {
    let n = elements[key];
    let element = n;
    if (typeof n === 'string') {
      element = root.querySelector(n);
    } else
    if (Array.isArray(n)) {
      element = n[0].querySelector(n[1]);
    }
    p[key] = element;
    return p;
  }, {});
  Object.assign(demoEle, _ele);
  let selectedChannel;
  channelData.forEach(n => {
    let { name, selected = false } = n;
    if (selected) {
      selectedChannel = n;
    }
    n.ele = createElement({ classes: ['channel', selected ? 'selected' : ''], text: name, parent: demoEle.channels });
    n.ele.addEventListener('click', () => loadChannel(n).catch(errorHandle));
  });
  demoEle.channelsList = Array.from(demoEle.channels.children);
  delay(600).then(() => loadChannel(selectedChannel)).catch(errorHandle);
});

function parseBrackets(text) {
  let changedBrackets = false;
  let result = text.replace(bracketsReplaceRegex, (match, tag, attributes) => {
    let attr = {};
    if (typeof attributes !== 'number') {
      attr = attributes.split(bracketsSplitRegex).
      filter(n => n && n.trim()).
      reduce((p, n) => (n[0] === '"' ? p[p.length - 1] += n : p.push(n), p), []).
      map(n => {
        let spl = n.split(/=/);
        // if(spl.length === 1) {
        // }
        if (numberTestRegex.test(spl[1])) {
          spl[1] = parseFloat(spl[1]);
        } else
        {
          let m = spl[1].match(/"(.*)"/);
          if (m !== null && m.length === 2) {
            spl[1] = m[1];
          }
        }
        return spl;
      }).
      reduce((p, n) => (p[n[0]] = n[1] || true, p), {});
      let ret = null;
      if (tag === 'emoji') {
        ret = `<img class="emoji" src="https://twemoji.maxcdn.com/2/svg/${attr.id.toLowerCase()}.svg">`;
      } else
      if (tag === 'strong') {
        ret = `<strong>${attr.text}</strong>`;
      }
      if (ret) {
        changedBrackets = true;
        return ret;
      }
    }
    return match;
  });
  return { result, changedBrackets };
}

function createElement(opts = {}) {
  let {
    tagName = 'div',
    classes = [],
    id = '',
    text = '',
    attrs = [],
    style = null,
    parent = null } =
  opts;
  let ele = document.createElement(tagName);
  if (typeof classes === 'string' && classes.length) {
    ele.classList.add(classes);
  } else
  if (Array.isArray(classes) && classes.length) {
    ele.classList.add(...classes.filter(n => n));
  }
  if (id) {
    ele.id = id;
  }
  if (text) {
    let hasBrackets = /\[.*?\]/g.test(text);
    let { result = text, changedBrackets = false } = hasBrackets ? parseBrackets(text) : {};
    ele[changedBrackets ? 'innerHTML' : 'innerText'] = result;
  }
  if (Array.isArray(attrs)) {
    if (attrs.length === 1) {
      let [attr] = attrs;
      ele.setAttribute(attr[0], attr[1]);
    } else
    if (attrs.length) {
      attrs.forEach(attr => ele.setAttribute(attr[0], attr[1]));
    }
  } else
  if (attrs) {
    let keys = Object.keys(attrs);
    keys.forEach(key => ele.setAttribute(key, attrs[key]));
  }
  if (style) {
    let keys = Object.keys(style);
    keys.forEach(key => ele.style[key] = style[key]);
  }
  if (parent) {
    parent.appendChild(ele);
  }
  return ele;
}
class Queue {
    constructor() {
        this.queue = [];
        this.index = 0;
        this.length = () => {return this.queue.length;}
    }

    push(item) {
        return this.queue.push(item);
    }

    shift() {
        let item = this.queue.at_counter(this.index);
        this.index++;
        return item;
    }

    get_last() {
        this.index--;
        return this.queue.at_counter(this.index);
    }

    get_current() {
        return this.queue.at_counter(this.index);
    }

    length() {
        return this.queue.length;
    }
}

var yandere_lastest_post_id;
var last_seen_post_id;
var self_enter = false;
var self_last_post_id;
var posts_list = new Queue();
var viewed_posts = [];
var current_post;
const max_queue_size = 100;

function open_img() {
    window.open(current_post.file_url);
}

(function () {
    let target_node = document.querySelector("#site-title");
    let button = document.createElement("button");
    button.setAttribute("width", "100");
    button.setAttribute("height", "75");
    button.setAttribute("onclick", "change_html()");
    button.innerText = "点击切换";
    target_node.appendChild(button);
})();
//Fetch lastest Post id
;(async function () {
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Origin", "https://yande.re");
    const url = "https://yande.re/post.json?limit=10";
    const response = await fetch(url, {
        method: "GET",
        headers: header,
        mode: "same-origin",
        referrer: "https://yande.re",
    });
    console.log(response.status);
    const arr = JSON.parse(await response.text());
    if (arr.length !== 0) {
        console.log(arr);
        yandere_lastest_post_id = arr[0].id;
        console.log(yandere_lastest_post_id);
        let cookie = cookieToJson();
        last_seen_post_id = cookie.last_seen_post_id;
        cookie.yandere_lastest_post_id = yandere_lastest_post_id;
    }
})();

async function traverse_posts() {
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Origin", "https://yande.re");
    let page = 1;
    while (last_seen_post_id <= yandere_lastest_post_id) {
        const url = `https://yande.re/post.json?limit=100&page=${page}`;
        const response = await fetch(url, {
            method: "GET",
            headers: header,
            mode: "same-origin",
            referrer: "https://yande.re",
        });
        const posts = JSON.parse(await response.text());
        for (let post of posts) {
            if (Number(post.id) < last_seen_post_id) {
                continue;
            }
            posts_list.push(post);
            // await try_to_put_post(post);
            last_seen_post_id = Number(post.id);
        }
        page++;
    }
}

async function try_to_put_post(post) {
    while (true) {
        if (posts_list.length > max_queue_size) {
            await new Promise((r) => setTimeout(r, 3000));
            continue;
        }
        posts_list.push(post);
        break;
    }
}

function change_img(move_forward) {
    if (move_forward) {
        current_post = posts_list.shift();
    } else {
        current_post = posts_list.get_last();
    }
    const post = handle_post(current_post);
    let url = post.preview_url;
    console.log(url);
    document.getElementById("screen").setAttribute("src", url);
    document.getElementById("some text").innerText = `您目前正在查看第 ${
        posts_list.index
    }张图片，共有 ${posts_list.length()}张`;
}

document.onkeydown = function (event) {
    if (event.code === "ArrowLeft") {
        change_img(false);
    } else if (event.code === "ArrowRight") {
        change_img(true);
    }
};

function handle_post(post) {
    let preview_url = post.preview_url;
    let file_url = post.file_url;
    let filename = file_url
        .split("/")
        [-1].replaceAll("%20")
        .replace(new RegExp('[\\\\/:*?"<>|]', "g"), "_");
    return {
        preview_url: preview_url,
        file_url: file_url,
        filename: filename,
    };
}

function cookieToJson() {
    let cookieArr = document.cookie.split(";");
    let obj = {};
    cookieArr.forEach((i) => {
        let arr = i.split("=");
        obj[arr[0]] = arr[1];
    });
    return obj;
}

function jsonToCookie(obj) {
    let full_string = "";
    for (let k of obj) {
        let str = `${k}=${obj[k]};`;
        full_string = full_string + str;
    }
    return full_string;
}


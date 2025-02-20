document.addEventListener("DOMContentLoaded", () => {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll(".nav-links a");
    const postLinks = document.querySelectorAll(".post-item a");

    // 获取所有内容区域
    const sections = document.querySelectorAll(".section");
    const postContents = document.querySelectorAll(".post-content");

    // 添加点击事件监听
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // 阻止默认行为

            // 获取目标内容的ID
            const target = link.getAttribute("href").substring(1);

            // 隐藏所有内容区域
            sections.forEach(section => {
                section.classList.remove("active");
            });

            postContents.forEach(postContent => {
                postContent.classList.remove("active");
            });

            // 显示目标内容区域
            document.getElementById(target).classList.add("active");

            // 如果目标是工具栏，加载工具内容
            if (target === "tools") {
                loadToolContent();
            }

            // 如果目标是文章列表，加载文章列表
            if (target === "posts") {
                loadPostList();
            }
        });
    });

    // 加载工具内容
    function loadToolContent() {
        const toolContentDiv = document.querySelector(".tool-content");
        toolContentDiv.innerHTML = ""; // 清空内容

        // 使用GitHub API获取Toolfolder文件夹内容
        fetch('https://api.github.com/repos/Only-Zone/WEB/contents/Toolfolder')
            .then(response => response.json())
            .then(data => {
                data.forEach(file => {
                    const toolItem = document.createElement("div");
                    toolItem.className = "tool-item";

                    const toolName = document.createElement("span");
                    toolName.className = "tool-name";
                    toolName.textContent = file.name;

                    const toolSize = document.createElement("span");
                    toolSize.className = "tool-size";
                    toolSize.textContent = file.size + " B";

                    const toolDate = document.createElement("span");
                    toolDate.className = "tool-date";
                    toolDate.textContent = new Date(file.commit.author.date).toLocaleString();

                    const downloadLink = document.createElement("a");
                    downloadLink.href = file.download_url;
                    downloadLink.textContent = "Download";
                    downloadLink.className = "download-button";

                    toolItem.appendChild(toolName);
                    toolItem.appendChild(toolSize);
                    toolItem.appendChild(toolDate);
                    toolItem.appendChild(downloadLink);

                    toolContentDiv.appendChild(toolItem);
                });
            })
            .catch(error => {
                console.error('Error fetching tool content:', error);
                toolContentDiv.innerHTML = "<p>Failed to load tools. Please try again later.</p>";
            });
    }

    // 加载文章列表
    function loadPostList() {
        const postListContainer = document.getElementById("postListContainer");
        postListContainer.innerHTML = ""; // 清空内容

        // 使用GitHub API获取Posts文件夹内容
        fetch('https://api.github.com/repos/Only-Zone/WEB/contents/Posts')
            .then(response => response.json())
            .then(data => {
                data.forEach(file => {
                    if (file.name.endsWith(".json")) {
                        const postItem = document.createElement("div");
                        postItem.className = "post-item";

                        const postLink = document.createElement("a");
                        postLink.href = `#articleContent?post=${file.name}`;
                        postLink.className = "post-link";

                        // 获取文章标题
                        fetch(file.download_url)
                            .then(response => response.json())
                            .then(postData => {
                                postLink.innerHTML = `
                                    <h3>${postData.title}</h3>
                                    <p>${postData.content.substring(0, 100)}...</p>
                                    <p>Uploaded: ${postData.date}</p>
                                `;
                            });

                        postItem.appendChild(postLink);
                        postListContainer.appendChild(postItem);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching post list:', error);
                postListContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
            });
    }

    // 加载文章内容
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash;
        if (hash.startsWith("#articleContent?post=")) {
            const postFileName = hash.substring(23);
            fetch(`https://raw.githubusercontent.com/Only-Zone/WEB/main/Posts/${postFileName}`)
                .then(response => response.json())
                .then(postData => {
                    document.getElementById("articleTitle").textContent = postData.title;
                    document.getElementById("articleDate").textContent = `Uploaded: ${postData.date}`;
                    document.getElementById("articleBody").innerHTML = postData.content;
                })
                .catch(error => {
                    console.error('Error fetching post content:', error);
                    document.getElementById("articleContent").innerHTML = "<p>Failed to load article. Please try again later.</p>";
                });
        }
    });
});
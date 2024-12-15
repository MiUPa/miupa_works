document.addEventListener('DOMContentLoaded', () => {
    // タイトルとメタ情報の更新
    document.title = `${siteConfig.author.name} - Portfolio`;
    document.querySelector('meta[name="author"]').content = siteConfig.author.name;

    // ヘッダーの更新
    document.querySelector('.logo').textContent = siteConfig.author.name;

    // ヒーローセクションの更新
    document.querySelector('#hero h1').textContent = siteConfig.author.name;
    document.querySelector('#hero .subtitle').textContent = siteConfig.author.title;

    // Aboutセクションの更新
    document.querySelector('#about p').textContent = siteConfig.author.description;
    
    // スキルの更新
    const skillsList = document.querySelector('.skills ul');
    skillsList.innerHTML = siteConfig.skills
        .map(skill => `<li>${skill.category}: ${skill.items}</li>`)
        .join('');

    // プロジェクトの更新
    const projectGrid = document.querySelector('.project-grid');
    projectGrid.innerHTML = siteConfig.projects
        .map(project => `
            <a href="${project.demoUrl}" class="project-card">
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}">
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="tech-stack">
                        ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                </div>
            </a>
        `)
        .join('');

    // ソーシャルリンクの更新
    const socialLinks = document.querySelector('.social-links');
    socialLinks.innerHTML = `
        <a href="${siteConfig.social.github}" target="_blank" class="button">GitHub</a>
        <a href="${siteConfig.social.twitter}" target="_blank" class="button">X</a>
    `;

    // コピーライトの更新
    document.querySelector('footer p').textContent = 
        `© ${siteConfig.copyright.year} ${siteConfig.copyright.holder}. All rights reserved.`;
}); 
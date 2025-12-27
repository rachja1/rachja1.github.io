// Publications loader from .bib file
(function() {
  'use strict';

  function formatAuthors(authors) {
    if (!authors) return '';
    
    const authorList = authors.split(' and ').map(author => {
      author = author.trim();
      // Handle "Last, First Middle" format
      const parts = author.split(',').map(p => p.trim());
      if (parts.length === 2) {
        return parts[1] + ' ' + parts[0];
      }
      return author;
    });

    if (authorList.length === 1) return authorList[0];
    if (authorList.length === 2) return authorList.join(' and ');
    
    const last = authorList.pop();
    return authorList.join(', ') + ', and ' + last;
  }

  function formatPublication(entry) {
    const authors = formatAuthors(entry.author || entry.editor);
    const title = entry.title ? `<em>${entry.title}</em>` : '';
    const journal = entry.journal ? `<em>${entry.journal}</em>` : '';
    const booktitle = entry.booktitle ? `<em>${entry.booktitle}</em>` : '';
    const venue = journal || booktitle;
    const year = entry.year || '';
    const volume = entry.volume || '';
    const number = entry.number ? `(${entry.number})` : '';
    const pages = entry.pages ? `, ${entry.pages}` : '';
    const doi = entry.doi ? ` DOI: <a href="https://doi.org/${entry.doi}" target="_blank">${entry.doi}</a>` : '';
    const url = entry.url && !entry.doi ? ` <a href="${entry.url}" target="_blank">[Link]</a>` : '';
    
    let citation = '';
    
    if (authors) citation += authors + '. ';
    if (title) citation += title + '. ';
    if (venue) {
      citation += venue;
      if (volume) citation += ` ${volume}`;
      if (number) citation += ` ${number}`;
      if (pages) citation += pages;
      citation += '. ';
    }
    if (year) citation += `(${year}).`;
    if (doi) citation += doi;
    if (url) citation += url;
    
    return citation.trim();
  }

  function renderPublications(bibEntries) {
    const container = document.getElementById('publications-container');
    if (!container) return;

    if (!bibEntries || bibEntries.length === 0) {
      container.innerHTML = '<p>No publications found. Please add a publications.bib file to the /static/data/ directory.</p>';
      return;
    }

    // Sort by year (most recent first)
    const sorted = Object.entries(bibEntries).sort((a, b) => {
      const yearA = parseInt(b[1].year || '0');
      const yearB = parseInt(a[1].year || '0');
      return yearA - yearB;
    });

    let html = '<div class="publications-list">';
    
    sorted.forEach(([key, entry]) => {
      const citation = formatPublication(entry);
      html += `
        <div class="publication-item">
          <p class="publication-citation">${citation}</p>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  function loadPublications() {
    const container = document.getElementById('publications-container');
    if (!container) return;

    // Try to load from /data/publications.bib
    fetch('/data/publications.bib')
      .then(response => {
        if (!response.ok) {
          throw new Error('BibTeX file not found');
        }
        return response.text();
      })
      .then(bibText => {
        try {
          // Parse BibTeX file
          const entries = parseBibTeX(bibText);
          renderPublications(entries);
        } catch (error) {
          console.error('Error parsing BibTeX:', error);
          container.innerHTML = '<p>Error parsing publications file. Please check the format of your .bib file.</p>';
        }
      })
      .catch(error => {
        console.error('Error loading publications:', error);
        container.innerHTML = '<p>No publications file found. Please add a <code>publications.bib</code> file to the <code>/static/data/</code> directory.</p>';
      });
  }

  // BibTeX parser
  function parseBibTeX(bibText) {
    const entries = {};
    
    // Remove comments
    bibText = bibText.replace(/%.*$/gm, '');
    
    // Split into entries by finding @ markers
    const entryRegex = /@(\w+)\s*\{\s*([^,\s{]+)\s*,/g;
    let lastIndex = 0;
    let matches = [];
    let match;
    
    // Find all entry start positions
    while ((match = entryRegex.exec(bibText)) !== null) {
      matches.push({
        type: match[1].toLowerCase(),
        key: match[2].trim(),
        start: match.index,
        endPos: match.index + match[0].length
      });
    }
    
    // Extract each entry's content
    for (let i = 0; i < matches.length; i++) {
      const entryMatch = matches[i];
      const nextStart = i < matches.length - 1 ? matches[i + 1].start : bibText.length;
      
      // Extract the entry content (everything after the key until next @)
      let entryContent = bibText.substring(entryMatch.endPos, nextStart).trim();
      // Remove trailing closing brace
      entryContent = entryContent.replace(/}\s*$/, '').trim();
      
      const entry = { type: entryMatch.type };
      
      // Parse fields - find field = value pairs
      // Handle nested braces by tracking depth
      let pos = 0;
      let braceDepth = 0;
      let inQuotes = false;
      let currentField = '';
      let currentValue = '';
      let readingField = true;
      
      for (let j = 0; j < entryContent.length; j++) {
        const char = entryContent[j];
        const prevChar = entryContent[j - 1];
        
        if (char === '"' && prevChar !== '\\') {
          inQuotes = !inQuotes;
          if (!readingField) currentValue += char;
        } else if (!inQuotes) {
          if (char === '{') {
            braceDepth++;
            if (!readingField) currentValue += char;
          } else if (char === '}') {
            braceDepth--;
            if (!readingField) currentValue += char;
          } else if (char === '=' && braceDepth === 0) {
            readingField = false;
            currentField = currentField.trim();
          } else if ((char === ',' || char === '\n') && braceDepth === 0 && !readingField) {
            // End of field
            let value = currentValue.trim();
            // Remove surrounding braces or quotes
            if ((value.startsWith('{') && value.endsWith('}'))) {
              value = value.slice(1, -1).trim();
            } else if ((value.startsWith('"') && value.endsWith('"'))) {
              value = value.slice(1, -1);
            }
            // Clean up LaTeX formatting
            value = value.replace(/\\[a-z]+\{([^}]+)\}/gi, '$1');
            value = value.replace(/\{|\}/g, '');
            
            if (currentField) {
              entry[currentField.toLowerCase()] = value;
            }
            currentField = '';
            currentValue = '';
            readingField = true;
            continue;
          } else {
            if (readingField) {
              currentField += char;
            } else {
              currentValue += char;
            }
          }
        } else {
          if (!readingField) currentValue += char;
        }
      }
      
      // Handle last field
      if (currentField && currentValue) {
        let value = currentValue.trim();
        if ((value.startsWith('{') && value.endsWith('}'))) {
          value = value.slice(1, -1).trim();
        } else if ((value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        value = value.replace(/\\[a-z]+\{([^}]+)\}/gi, '$1');
        value = value.replace(/\{|\}/g, '');
        entry[currentField.toLowerCase()] = value;
      }
      
      entries[entryMatch.key] = entry;
    }
    
    return entries;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPublications);
  } else {
    loadPublications();
  }
})();


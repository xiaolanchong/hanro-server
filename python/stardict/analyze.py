from collections import namedtuple
from stardictsajeon import StardictRuSajeon, StardictKoSajeon


Section = namedtuple('Section', ['definition', 'sample'])
Article = namedtuple('Article', ['name', 'hanja', 'sections'])


def find_samples(lines):
    for index, line in enumerate(lines[1:]):
        if line[0:4] != '~하다 ' or line[0:1] != '= ':
            return index + 1
    return len(lines)


def analyze_ru():
    dictionary = StardictRuSajeon()

    print(f'total words={len(dictionary.get_all_words())}')

    article_list = []
    headers = []
    for index, word in enumerate(dictionary.get_all_words()):
        defn = dictionary.get_definition(word, add_examples=True)
        articles = defn.split('\n\n')
        #if len(articles) > 1:
        #    print(f'# {word}')
        for article in articles:
            lines = article.split('\n')
            title, *rest = lines[0].split(' ')
            headers.append(lines[0])
            hanja = None
            if len(rest) == 1:
                hanja = rest[0]
            elif len(rest) > 1:
                #print(f'Unknown format: {lines[0]}')
                pass
            sections = []
            if len(lines) == 1:
                if word not in incorrect_format_words:
                    print(f'Too few lines: {lines[0]}, article: {defn}')
                else:
                    sections.append(Section(lines[1:sample_index], lines[sample_index:]))
            elif lines[1][0:2] != '1.':
                sample_index = find_samples(lines[1:]) + 1
                sections.append(Section(lines[1:sample_index], lines[sample_index:]))
            else:
                #print(f'Skipped {lines[0]} {lines[1]}')
                #re.split('^\d+\.', )
                pass
            article_list.append(Article(title, hanja, sections))
        #if index > 100:
        #    break

    from pprint import pprint
    # pprint(article_list)
    for header in headers:
        #print(header.strip())
        pass


def print_ko():
    from pprint import pprint
    dictionary = StardictKoSajeon()

    print(f'total words={len(dictionary.get_all_words())}')

    for index, word in enumerate( dictionary.get_all_words() ):
        defn = dictionary.get_definition(word, add_examples=True)
        print(word, defn)
        if index > 10:
            break


print_ru()
#print_ko()
from datetime import datetime
from collections import namedtuple
from stardictsajeon import StardictRuSajeon
import sqlite3
import typing
from pprint import pprint
from pathlib import Path


SimpleArticle = namedtuple('SimpleArticle', ['word', 'order', 'definition'])

incorrect_format_words = {
    '강기': """강기 剛氣
""",
    '고사':
    """고사 
...은 ~하고 не говоря о чем, оставляя в стороне что

고사 古事
древние обычаи; историческое событие; древнее событие; события давно минувших дней

고사 古史
древняя история

고사 古寺
древний храм, древний монастырь

고사 告祀
жертвоприношение духам с мольбой о предотвращении несчастий
~를 지내다 (올리다) совершать жертвоприношение духам и молить о предотвращении несчастья

고사 固辭
абсолютный отказ
~하다 отказать наотрез

고사 故事
1. источник; начало; происхождение
2. исторический факт
~를 인용하다 ссылаться на исторический факт
3. фольклор

고사 枯死
~하다 засохнуть, высохнуть на корню
~한 나무 засохшее дерево

고사 考査
экзамен; испытание, проба, проверка
기말 ~ сессия

고사 高士
благородный, великодушный человек""",
    '애호가':
    """애호가 愛好家
любитель; почитатель; поклонник; болельщик""",
    '야차': """야차 夜叉
(будд.) якша (женское демоническое существо)""",
    '형': """형 兄
старший брат
~만한 아우 없다 Старший брат во всём первый.

형 刑
= 형벌

형 型
образец; тип; форма

형 形
форма; вид; облик"""}


def get_articles(max_words: int) -> typing.List[typing.Tuple[str, str]]:
    dictionary = StardictRuSajeon()
    article_dict = dict()
    for index, word in enumerate(dictionary.get_all_words()):
        if max_words is not None and index >= max_words:
            break
        if word in incorrect_format_words:
            article = incorrect_format_words[word]
        else:
            article = dictionary.get_definition(word, add_examples=True)
        sections = article.split('\n\n')
        word = word.lstrip('-')  # join suffixes '-xxx' with 'xxx'' words
        for order, section in enumerate(sections):
            stripped_section = '\n'.join(line.rstrip() for line in section.split('\n'))
            article_dict.setdefault(word, []).append(stripped_section)

    sorted_keys = article_dict.keys()
    sorted_keys = sorted(sorted_keys)
    return [(word, '\n\n'.join(article_dict[word])) for word in sorted_keys]


def dump_to_db(article_list: typing.List[SimpleArticle]):
    dict_path = Path('./../../../hanro-dict.db')
    bot_id = 2
    checked = False
    hidden = True
    now = datetime.utcnow()
    with sqlite3.connect(str(dict_path.absolute())) as con:
        data = ((article.word, article.order, article.definition, now, bot_id, checked, hidden)
                for article in article_list)
        con.executemany("insert into word(word, 'order', definition, last_edited, last_edited_by_user, "
                        "checked, hidden) "
                        "values (?, ?, ?, ?, ?, ?, ?)", data)


def dump_one_article_per_word(article_list: typing.List[typing.Tuple[str, str]]):
    dict_path = Path('./../../../hanro-dict.db')
    bot_id = 2
    checked = False
    hidden = True
    now = datetime.utcnow()
    with sqlite3.connect(str(dict_path.absolute())) as con:
        data = ((article[0], 0, article[1], now, bot_id, checked, hidden)
                for article in article_list)
        con.executemany("insert into word(word, 'order', definition, last_edited, last_edited_by_user, "
                        "checked, hidden) "
                        "values (?, ?, ?, ?, ?, ?, ?)", data)


def dump_to_term(articles):
    with open('dalma-dict.txt', mode='w', encoding='utf8') as f:
        for article in articles:
            #f.write(article[0])
            #f.write('\n')
            f.write(article[1])
            f.write('\n\n')


articles = get_articles(None)
#pprint(articles)
#dump_one_article_per_word(articles)
dump_to_file(articles)

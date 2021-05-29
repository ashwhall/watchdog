import dash
import dash_html_components as html
import os
import database as db

app = dash.Dash(__name__, assets_folder=os.getcwd())

# assume you have a "long-form" data frame
# see https://plotly.com/python/px-arguments/ for more options

def generate_thumbnail(href, info):
    colour = '#cccccc'
    if info['desired'] == False:
        colour = '#fc9d9d'
    elif info['desired']:
        colour = '#abfc9d'

    return html.Div([
        html.A([
            html.Img(
                src=app.get_asset_url(info['img']),
                style={
                    'width': '250px',
                    'height': '250px',
                    'object-fit': 'cover',
                    'flex': '1',
                    'border-radius': '10px'
                }
            )
        ], href=href),

        html.Div([
            html.Div('Predicted Breeds', style={'font-weight': 'bold'}),

            html.Div([
                html.Div(b.split(',')[0]) for b in info['predicted_classes']
            ])if info['predicted_classes'] else html.Div([
                'No predictions yet'
            ]),

            html.Div(f'Scraped: {info["scrape_datetime"][:info["scrape_datetime"].rindex(".")]}',
                     style={'margin': '10px', 'font-style': 'italic'})
        ],
        style={
            'text-align': 'center'
        }),
    ],
    style={
        'background-color': colour,
        'margin': '10px',
        'border-radius': '5px',
    })


def serve_layout():
    db.reload_database()
    dogs = db.get_records().items()
    desired = len([href for href, info in dogs if info['desired']])
    dogs = list(reversed(sorted(dogs, key=lambda item: item[1]['scrape_datetime'])))
    images_div = []
    for href, info in dogs:
        images_div.append(generate_thumbnail(
            href=href,
            info=info
        ))


    return html.Div(children=[
        html.H1(children='WatchDog', style={'text-align': 'center'}),
        html.H2(children=f'{len(dogs)} Doggies! ({desired} desired)', style={'text-align': 'center'}),

        html.Div(images_div,
                 style={
                     'display': 'flex',
                     'flex-wrap': 'wrap',
                     'align-items': 'center',
                     'justify-content': 'center'
                 })
    ])
app.layout = serve_layout

if __name__ == '__main__':
    app.run_server(debug=True)

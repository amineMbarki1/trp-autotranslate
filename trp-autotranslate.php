<?php

/**
 * Plugin Name: Translatepress autotranslate
 */
function inject_html()
{
    echo '<pre style="margin-top:700px;">';
    echo '</pre>';
    echo "hello";

    echo '
        <dialog class="translate-all-dialog">
          <button class="translate-all-dialog__close">x</button>

        </dialog>
    ';
}


function enqueue_assets()
{

    if (!strpos($_SERVER['REQUEST_URI'], 'trp-edit')) return;


    inject_html();

    wp_enqueue_style(
        'my-plugin-style',
        plugin_dir_url(__FILE__) . 'css/style.css',
        array(),
        '1.0.0',
        'all'
    );


    wp_enqueue_script_module(
        'my-plugin-script',
        plugin_dir_url(__FILE__) . 'js/main.js',
        array(),
        '1.0.0',

    );
}


add_action('wp_enqueue_scripts', 'enqueue_assets');
